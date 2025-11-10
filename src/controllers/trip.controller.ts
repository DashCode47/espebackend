import { Request, Response, NextFunction } from 'express';
import { TripStatus, TripRequestStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/errorHandler';
import { createNotification } from './notification.controller';
import { UserRole } from '../middlewares/role.middleware';

interface CreateTripBody {
  origin: string;
  destination: string;
  departureTime: string; // ISO string
  availableSeats: number;
  price?: number;
  notes?: string;
}

interface UpdateTripBody {
  origin?: string;
  destination?: string;
  departureTime?: string;
  availableSeats?: number;
  price?: number;
  notes?: string;
}

interface ConfirmTripBody {
  requestId: string;
}

interface CreateRatingBody {
  rating: number; // 1-5
  comment?: string;
}

// GET /api/trips - Listar viajes activos con filtros opcionales
export const getTrips = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { origin, destination, date, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      status: TripStatus.ACTIVE
    };

    if (origin) {
      where.origin = { contains: origin as string, mode: 'insensitive' };
    }

    if (destination) {
      where.destination = { contains: destination as string, mode: 'insensitive' };
    }

    // Filtro de fecha de salida
    const now = new Date();
    if (date) {
      const dateObj = new Date(date as string);
      const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
      // Asegurar que la fecha filtrada no sea en el pasado
      where.departureTime = {
        gte: startOfDay > now ? startOfDay : now,
        lte: endOfDay
      };
    } else {
      // No mostrar viajes pasados si no hay filtro de fecha
      where.departureTime = {
        gte: now
      };
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              career: true
            }
          },
          requests: {
            where: { status: TripRequestStatus.ACCEPTED },
            select: {
              id: true,
              passenger: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true
                }
              }
            }
          },
          ratings: {
            select: {
              rating: true
            }
          }
        },
        orderBy: {
          departureTime: 'asc'
        },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.trip.count({ where })
    ]);

    // Calcular rating promedio del conductor para cada viaje
    const tripsWithRating = trips.map(trip => {
      const ratings = trip.ratings.map(r => r.rating);
      const avgRating = ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;

      return {
        ...trip,
        driver: {
          ...trip.driver,
          averageRating: avgRating,
          totalRatings: ratings.length
        }
      };
    });

    res.json({
      status: 'success',
      data: {
        trips: tripsWithRating,
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

// GET /api/trips/:id - Obtener detalle de un viaje
export const getTripById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            career: true,
            bio: true
          }
        },
        requests: {
          include: {
            passenger: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                career: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        ratings: {
          include: {
            rater: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!trip) {
      throw new AppError(404, 'Trip not found');
    }

    // Calcular rating promedio del conductor
    const ratings = trip.ratings.map(r => r.rating);
    const avgRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : null;

    res.json({
      status: 'success',
      data: {
        trip: {
          ...trip,
          driver: {
            ...trip.driver,
            averageRating: avgRating,
            totalRatings: ratings.length
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/trips - Crear viaje (solo DRIVER)
export const createTrip = async (
  req: Request<{}, {}, CreateTripBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const { origin, destination, departureTime, availableSeats, price, notes } = req.body;

    // Validaciones
    if (!origin || !destination || !departureTime || !availableSeats) {
      throw new AppError(400, 'Origin, destination, departureTime, and availableSeats are required');
    }

    if (availableSeats < 1) {
      throw new AppError(400, 'Available seats must be at least 1');
    }

    const departureDate = new Date(departureTime);
    if (departureDate < new Date()) {
      throw new AppError(400, 'Departure time cannot be in the past');
    }

    // Verificar que el usuario es DRIVER
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // @ts-ignore - role exists in database after migration
    if (!user || (user.role as string) !== UserRole.STUDENT && (user.role as string) !== UserRole.DRIVER) {
      throw new AppError(403, 'Only students and drivers can create trips');
    }

    // Verificar si ya existe un viaje activo del mismo conductor en la misma fecha/hora
    const existingTrip = await prisma.trip.findFirst({
      where: {
        driverId: userId,
        status: TripStatus.ACTIVE,
        departureTime: {
          gte: new Date(departureDate.getTime() - 2 * 60 * 60 * 1000), // 2 horas antes
          lte: new Date(departureDate.getTime() + 2 * 60 * 60 * 1000) // 2 horas después
        }
      }
    });

    if (existingTrip) {
      throw new AppError(409, 'You already have an active trip at this time');
    }

    const trip = await prisma.trip.create({
      data: {
        driverId: userId,
        origin,
        destination,
        departureTime: departureDate,
        availableSeats,
        price: price || null,
        notes: notes || null,
        status: TripStatus.ACTIVE
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            career: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      data: { trip }
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/trips/:id - Actualizar viaje (solo creador)
export const updateTrip = async (
  req: Request<{ id: string }, {}, UpdateTripBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const trip = await prisma.trip.findUnique({
      where: { id }
    });

    if (!trip) {
      throw new AppError(404, 'Trip not found');
    }

    if (trip.driverId !== userId) {
      throw new AppError(403, 'Only the trip creator can update it');
    }

    if (trip.status === TripStatus.CANCELLED) {
      throw new AppError(400, 'Cannot update a cancelled trip');
    }

    const { origin, destination, departureTime, availableSeats, price, notes } = req.body;

    const updateData: any = {};

    if (origin) updateData.origin = origin;
    if (destination) updateData.destination = destination;
    if (departureTime) {
      const departureDate = new Date(departureTime);
      if (departureDate < new Date()) {
        throw new AppError(400, 'Departure time cannot be in the past');
      }
      updateData.departureTime = departureDate;
    }
    if (availableSeats !== undefined) {
      if (availableSeats < 1) {
        throw new AppError(400, 'Available seats must be at least 1');
      }
      // Verificar que no se reduzcan los asientos por debajo de los pasajeros aceptados
      const acceptedRequests = await prisma.tripRequest.count({
        where: {
          tripId: id,
          status: TripRequestStatus.ACCEPTED
        }
      });
      if (availableSeats < acceptedRequests) {
        throw new AppError(400, `Cannot reduce seats below ${acceptedRequests} accepted passengers`);
      }
      updateData.availableSeats = availableSeats;
    }
    if (price !== undefined) updateData.price = price;
    if (notes !== undefined) updateData.notes = notes;

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: updateData,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            career: true
          }
        }
      }
    });

    res.json({
      status: 'success',
      data: { trip: updatedTrip }
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/trips/:id - Cancelar viaje
export const cancelTrip = async (
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

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        requests: {
          where: { status: TripRequestStatus.ACCEPTED },
          include: {
            passenger: {
              select: { id: true }
            }
          }
        }
      }
    });

    if (!trip) {
      throw new AppError(404, 'Trip not found');
    }

    if (trip.driverId !== userId) {
      throw new AppError(403, 'Only the trip creator can cancel it');
    }

    if (trip.status === TripStatus.CANCELLED) {
      throw new AppError(400, 'Trip is already cancelled');
    }

    // Actualizar el viaje a CANCELLED
    const cancelledTrip = await prisma.trip.update({
      where: { id },
      data: { status: TripStatus.CANCELLED }
    });

    // Rechazar todas las solicitudes pendientes
    await prisma.tripRequest.updateMany({
      where: {
        tripId: id,
        status: TripRequestStatus.PENDING
      },
      data: {
        status: TripRequestStatus.REJECTED
      }
    });

    // Notificar a los pasajeros aceptados
    for (const request of trip.requests) {
      await createNotification(
        request.passenger.id,
        `El viaje a ${trip.destination} ha sido cancelado por el conductor.`
      );
    }

    res.json({
      status: 'success',
      message: 'Trip cancelled successfully',
      data: { trip: cancelledTrip }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/trips/:id/join - Unirse a un viaje
export const joinTrip = async (
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

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        driver: {
          select: { id: true, name: true }
        },
        requests: {
          where: {
            passengerId: userId
          }
        }
      }
    });

    if (!trip) {
      throw new AppError(404, 'Trip not found');
    }

    if (trip.status !== TripStatus.ACTIVE) {
      throw new AppError(400, 'Trip is not active');
    }

    if (trip.driverId === userId) {
      throw new AppError(400, 'Driver cannot join their own trip');
    }

    // Verificar si ya existe una solicitud
    if (trip.requests.length > 0) {
      const existingRequest = trip.requests[0];
      if (existingRequest.status === TripRequestStatus.PENDING) {
        throw new AppError(409, 'You already have a pending request for this trip');
      }
      if (existingRequest.status === TripRequestStatus.ACCEPTED) {
        throw new AppError(409, 'You are already accepted in this trip');
      }
    }

    // Crear solicitud
    const request = await prisma.tripRequest.create({
      data: {
        tripId: id,
        passengerId: userId,
        status: TripRequestStatus.PENDING
      },
      include: {
        passenger: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            career: true
          }
        }
      }
    });

    // Notificar al conductor
    await createNotification(
      trip.driver.id,
      `${request.passenger.name} quiere unirse a tu viaje a ${trip.destination}`
    );

    res.status(201).json({
      status: 'success',
      message: 'Trip request created successfully',
      data: { request }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/trips/:id/confirm - Conductor acepta pasajero
export const confirmPassenger = async (
  req: Request<{ id: string }, {}, ConfirmTripBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { requestId } = req.body;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    if (!requestId) {
      throw new AppError(400, 'requestId is required');
    }

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        requests: {
          where: { status: TripRequestStatus.ACCEPTED }
        }
      }
    });

    if (!trip) {
      throw new AppError(404, 'Trip not found');
    }

    if (trip.driverId !== userId) {
      throw new AppError(403, 'Only the trip driver can confirm passengers');
    }

    if (trip.status !== TripStatus.ACTIVE) {
      throw new AppError(400, 'Trip is not active');
    }

    const request = await prisma.tripRequest.findUnique({
      where: { id: requestId },
      include: {
        passenger: {
          select: { id: true, name: true }
        }
      }
    });

    if (!request) {
      throw new AppError(404, 'Trip request not found');
    }

    if (request.tripId !== id) {
      throw new AppError(400, 'Request does not belong to this trip');
    }

    if (request.status !== TripRequestStatus.PENDING) {
      throw new AppError(400, 'Request is not pending');
    }

    // Verificar que hay asientos disponibles
    const acceptedCount = trip.requests.length;
    if (acceptedCount >= trip.availableSeats) {
      throw new AppError(400, 'Trip is full');
    }

    // Aceptar la solicitud
    const updatedRequest = await prisma.tripRequest.update({
      where: { id: requestId },
      data: { status: TripRequestStatus.ACCEPTED },
      include: {
        passenger: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            career: true
          }
        }
      }
    });

    // Verificar si el viaje está lleno ahora
    const newAcceptedCount = acceptedCount + 1;
    let updatedTrip: any = trip;

    if (newAcceptedCount >= trip.availableSeats) {
      updatedTrip = await prisma.trip.update({
        where: { id },
        data: { status: TripStatus.FULL },
        include: {
          requests: {
            where: { status: TripRequestStatus.ACCEPTED }
          }
        }
      });
    }

    // Notificar al pasajero
    await createNotification(
      request.passenger.id,
      `Tu solicitud para el viaje a ${trip.destination} ha sido aceptada!`
    );

    res.json({
      status: 'success',
      message: 'Passenger confirmed successfully',
      data: {
        request: updatedRequest,
        trip: updatedTrip
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id/trips - Listar viajes creados o reservados por un usuario
export const getUserTrips = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { type = 'all' } = req.query; // 'created', 'joined', 'all'

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    let trips: any[] = [];

    if (type === 'created' || type === 'all') {
      const createdTrips = await prisma.trip.findMany({
        where: { driverId: id },
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              career: true
            }
          },
          requests: {
            include: {
              passenger: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true
                }
              }
            }
          }
        },
        orderBy: {
          departureTime: 'desc'
        }
      });
      trips = [...trips, ...createdTrips.map(t => ({ ...t, userRole: 'driver' }))];
    }

    if (type === 'joined' || type === 'all') {
      const joinedRequests = await prisma.tripRequest.findMany({
        where: {
          passengerId: id,
          status: TripRequestStatus.ACCEPTED
        },
        include: {
          trip: {
            include: {
              driver: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                  career: true
                }
              },
              requests: {
                include: {
                  passenger: {
                    select: {
                      id: true,
                      name: true,
                      avatarUrl: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      trips = [...trips, ...joinedRequests.map(r => ({ ...r.trip, userRole: 'passenger' }))];
    }

    // Eliminar duplicados si type === 'all'
    if (type === 'all') {
      const uniqueTrips = trips.reduce((acc, trip) => {
        if (!acc.find((t: any) => t.id === trip.id)) {
          acc.push(trip);
        }
        return acc;
      }, [] as any[]);
      trips = uniqueTrips;
    }

    // Ordenar por fecha de salida
    trips.sort((a, b) => {
      return new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime();
    });

    res.json({
      status: 'success',
      data: { trips }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/trips/:id/rating - Calificar conductor
export const rateDriver = async (
  req: Request<{ id: string }, {}, CreateRatingBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    if (!rating || rating < 1 || rating > 5) {
      throw new AppError(400, 'Rating must be between 1 and 5');
    }

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        driver: {
          select: { id: true }
        }
      }
    });

    if (!trip) {
      throw new AppError(404, 'Trip not found');
    }

    // Verificar que el usuario fue pasajero aceptado en este viaje
    const request = await prisma.tripRequest.findFirst({
      where: {
        tripId: id,
        passengerId: userId,
        status: TripRequestStatus.ACCEPTED
      }
    });

    if (!request) {
      throw new AppError(403, 'You can only rate trips you participated in');
    }

    // Verificar si ya calificó
    const existingRating = await prisma.tripRating.findUnique({
      where: {
        tripId_raterId: {
          tripId: id,
          raterId: userId
        }
      }
    });

    if (existingRating) {
      throw new AppError(409, 'You have already rated this trip');
    }

    const tripRating = await prisma.tripRating.create({
      data: {
        tripId: id,
        raterId: userId,
        driverId: trip.driver.id,
        rating,
        comment: comment || null
      },
      include: {
        rater: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Rating created successfully',
      data: { rating: tripRating }
    });
  } catch (error) {
    next(error);
  }
};

