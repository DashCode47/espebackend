import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/errorHandler';
import { uploadToGCS, generateFileName, deleteFromGCS } from '../utils/gcs';

enum EventCategory {
  SOCIAL = 'SOCIAL',
  ACADEMIC = 'ACADEMIC',
  PRIVATE = 'PRIVATE',
  SPORTS = 'SPORTS',
  OTHER = 'OTHER'
}

interface CreateEventBody {
  nombre: string;
  descripcion: string;
  categoria: EventCategory;
  fechaInicio: string;
  fechaFin?: string;
  ubicacion: string;
  precio?: number;
}

interface UpdateEventBody {
  nombre?: string;
  descripcion?: string;
  categoria?: EventCategory;
  fechaInicio?: string;
  fechaFin?: string;
  ubicacion?: string;
  precio?: number;
}

// Get all events with optional filters
export const getEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      categoria, 
      fechaInicio, 
      fechaFin, 
      ubicacion,
      page = '1', 
      limit = '10' 
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build where clause
    const where: any = {};

    if (categoria) {
      const validCategories = Object.values(EventCategory);
      if (!validCategories.includes(categoria as EventCategory)) {
        throw new AppError(400, `Invalid category. Must be one of: ${validCategories.join(', ')}`);
      }
      where.categoria = categoria as EventCategory;
    }

    if (fechaInicio) {
      where.fechaInicio = {
        gte: new Date(fechaInicio as string)
      };
    }

    if (fechaFin) {
      where.fechaFin = {
        lte: new Date(fechaFin as string)
      };
    }

    if (ubicacion) {
      where.ubicacion = {
        contains: ubicacion as string,
        mode: 'insensitive'
      };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          creador: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          },
          attendances: {
            select: {
              userId: true
            }
          },
          _count: {
            select: {
              attendances: true
            }
          }
        },
        orderBy: {
          fechaInicio: 'asc'
        },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.event.count({ where })
    ]);

    // Transform events to include attendee count and check if current user is attending
    const userId = req.user?.userId;
    const transformedEvents = events.map(event => ({
      ...event,
      asistentesCount: event._count.attendances,
      isAttending: userId ? event.attendances.some(a => a.userId === userId) : false,
      attendances: undefined, // Remove attendances array from response
      _count: undefined // Remove _count from response
    }));

    res.json({
      status: 'success',
      data: {
        events: transformedEvents,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a single event by ID
export const getEvent = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creador: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            career: true
          }
        },
        attendances: {
          select: {
            userId: true
          }
        },
        _count: {
          select: {
            attendances: true
          }
        }
      }
    });

    if (!event) {
      throw new AppError(404, 'Event not found');
    }

    const transformedEvent = {
      ...event,
      asistentesCount: event._count.attendances,
      isAttending: userId ? event.attendances.some(a => a.userId === userId) : false,
      attendances: undefined,
      _count: undefined
    };

    res.json({
      status: 'success',
      data: { event: transformedEvent }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new event
export const createEvent = async (
  req: Request<{}, {}, CreateEventBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { nombre, descripcion, categoria, fechaInicio, fechaFin, ubicacion, precio } = req.body;
    const file = req.file;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    // Validate required fields
    if (!nombre || !descripcion || !categoria || !fechaInicio || !ubicacion) {
      throw new AppError(400, 'nombre, descripcion, categoria, fechaInicio, and ubicacion are required');
    }

    // Validate category
    const validCategories = Object.values(EventCategory);
    if (!validCategories.includes(categoria as EventCategory)) {
      throw new AppError(400, `Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    // Validate dates
    const startDate = new Date(fechaInicio);
    if (isNaN(startDate.getTime())) {
      throw new AppError(400, 'Invalid fechaInicio format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)');
    }

    let endDate: Date | undefined;
    if (fechaFin) {
      endDate = new Date(fechaFin);
      if (isNaN(endDate.getTime())) {
        throw new AppError(400, 'Invalid fechaFin format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)');
      }
      if (endDate < startDate) {
        throw new AppError(400, 'fechaFin must be after fechaInicio');
      }
    }

    // Validate price
    const eventPrice = precio !== undefined ? parseFloat(precio.toString()) : 0;
    if (eventPrice < 0) {
      throw new AppError(400, 'Price cannot be negative');
    }

    let imageUrl: string | undefined;

    // If an image file was uploaded, upload it to Google Cloud Storage
    if (file) {
      if (!file.buffer || file.buffer.length === 0) {
        throw new AppError(400, 'Image file is empty or invalid');
      }

      try {
        const fileName = generateFileName(file.originalname || 'event.jpg', userId, 'events');
        imageUrl = await uploadToGCS(file.buffer, fileName, file.mimetype || 'image/jpeg');
      } catch (uploadError) {
        if (uploadError instanceof AppError) {
          throw uploadError;
        }
        throw new AppError(500, `Failed to upload image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
      }
    }

    const event = await prisma.event.create({
      data: {
        nombre,
        descripcion,
        categoria: categoria as EventCategory,
        fechaInicio: startDate,
        fechaFin: endDate,
        ubicacion,
        precio: eventPrice,
        creadoPor: userId,
        imagen: imageUrl
      },
      include: {
        creador: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        _count: {
          select: {
            attendances: true
          }
        }
      }
    });

    const transformedEvent = {
      ...event,
      asistentesCount: event._count.attendances,
      isAttending: false,
      _count: undefined
    };

    res.status(201).json({
      status: 'success',
      message: 'Event created successfully',
      data: { event: transformedEvent }
    });
  } catch (error) {
    next(error);
  }
};

// Update an event
export const updateEvent = async (
  req: Request<{ id: string }, {}, UpdateEventBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { nombre, descripcion, categoria, fechaInicio, fechaFin, ubicacion, precio } = req.body;
    const file = req.file;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      throw new AppError(404, 'Event not found');
    }

    // Check if user is the creator
    if (existingEvent.creadoPor !== userId) {
      throw new AppError(403, 'Not authorized to update this event');
    }

    // Build update data
    const updateData: any = {};

    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (ubicacion !== undefined) updateData.ubicacion = ubicacion;
    if (precio !== undefined) {
      const eventPrice = parseFloat(precio.toString());
      if (eventPrice < 0) {
        throw new AppError(400, 'Price cannot be negative');
      }
      updateData.precio = eventPrice;
    }

    if (categoria !== undefined) {
      const validCategories = Object.values(EventCategory);
      if (!validCategories.includes(categoria as EventCategory)) {
        throw new AppError(400, `Invalid category. Must be one of: ${validCategories.join(', ')}`);
      }
      updateData.categoria = categoria as EventCategory;
    }

    if (fechaInicio !== undefined) {
      const startDate = new Date(fechaInicio);
      if (isNaN(startDate.getTime())) {
        throw new AppError(400, 'Invalid fechaInicio format. Use ISO 8601 format');
      }
      updateData.fechaInicio = startDate;
    }

    if (fechaFin !== undefined) {
      if (fechaFin === null || fechaFin === '') {
        updateData.fechaFin = null;
      } else {
        const endDate = new Date(fechaFin);
        if (isNaN(endDate.getTime())) {
          throw new AppError(400, 'Invalid fechaFin format. Use ISO 8601 format');
        }
        const startDate = updateData.fechaInicio || existingEvent.fechaInicio;
        if (endDate < startDate) {
          throw new AppError(400, 'fechaFin must be after fechaInicio');
        }
        updateData.fechaFin = endDate;
      }
    }

    let imageUrl = existingEvent.imagen;

    // If a new image file was uploaded, upload it to Google Cloud Storage
    if (file) {
      try {
        // Delete old image from GCS if it exists
        if (existingEvent.imagen && existingEvent.imagen.includes('storage.googleapis.com')) {
          const oldFileName = existingEvent.imagen.split('/').pop();
          if (oldFileName) {
            await deleteFromGCS(`events/${userId}/${oldFileName}`);
          }
        }

        // Upload new image
        const fileName = generateFileName(file.originalname || 'event.jpg', userId, 'events');
        imageUrl = await uploadToGCS(file.buffer, fileName, file.mimetype || 'image/jpeg');
        updateData.imagen = imageUrl;
      } catch (uploadError) {
        console.error('Error uploading image to GCS:', uploadError);
        throw new AppError(500, 'Failed to upload image');
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        creador: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        _count: {
          select: {
            attendances: true
          }
        }
      }
    });

    const transformedEvent = {
      ...updatedEvent,
      asistentesCount: updatedEvent._count.attendances,
      isAttending: false,
      _count: undefined
    };

    res.json({
      status: 'success',
      message: 'Event updated successfully',
      data: { event: transformedEvent }
    });
  } catch (error) {
    next(error);
  }
};

// Delete an event
export const deleteEvent = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      throw new AppError(404, 'Event not found');
    }

    // Check if user is the creator
    if (event.creadoPor !== userId) {
      throw new AppError(403, 'Not authorized to delete this event');
    }

    // Delete image from GCS if it exists
    if (event.imagen && event.imagen.includes('storage.googleapis.com')) {
      try {
        const fileName = event.imagen.split('/').pop();
        if (fileName) {
          await deleteFromGCS(`events/${userId}/${fileName}`);
        }
      } catch (error) {
        console.error('Error deleting image from GCS:', error);
        // Continue with event deletion even if image deletion fails
      }
    }

    // Delete event (cascade will delete attendances)
    await prisma.event.delete({
      where: { id }
    });

    res.json({
      status: 'success',
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Confirm attendance to an event
export const attendEvent = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { id: eventId } = req.params;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new AppError(404, 'Event not found');
    }

    // Check if user is already attending
    const existingAttendance = await prisma.eventAttendance.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    });

    if (existingAttendance) {
      throw new AppError(400, 'You are already attending this event');
    }

    // Create attendance
    await prisma.eventAttendance.create({
      data: {
        eventId,
        userId
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Attendance confirmed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Cancel attendance to an event
export const cancelAttendance = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { id: eventId } = req.params;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new AppError(404, 'Event not found');
    }

    // Check if user is attending
    const attendance = await prisma.eventAttendance.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    });

    if (!attendance) {
      throw new AppError(404, 'You are not attending this event');
    }

    // Delete attendance
    await prisma.eventAttendance.delete({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    });

    res.json({
      status: 'success',
      message: 'Attendance cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get attendees of an event
export const getEventAttendees = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: eventId } = req.params;
    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new AppError(404, 'Event not found');
    }

    const [attendances, total] = await Promise.all([
      prisma.eventAttendance.findMany({
        where: { eventId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              career: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.eventAttendance.count({
        where: { eventId }
      })
    ]);

    const attendees = attendances.map(attendance => ({
      id: attendance.user.id,
      name: attendance.user.name,
      email: attendance.user.email,
      avatarUrl: attendance.user.avatarUrl,
      career: attendance.user.career,
      attendedAt: attendance.createdAt
    }));

    res.json({
      status: 'success',
      data: {
        attendees,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

