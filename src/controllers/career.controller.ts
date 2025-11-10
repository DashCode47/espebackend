import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middlewares/errorHandler';

interface CreateCareerBody {
  code: string;
  name: string;
  modality: string;
  duration: number;
  schedule: string;
  campus: string;
  cesResolution: string;
  directorName: string;
  directorEmail: string;
  accreditations: string[];
  mission: string;
  vision: string;
  objectives: string[];
  graduateProfile: string;
  professionalProfile: string;
  curriculumPdfUrl?: string;
  curriculumDescription: string;
  subjects: string[];
  isActive?: boolean;
}

interface UpdateCareerBody {
  code?: string;
  name?: string;
  modality?: string;
  duration?: number;
  schedule?: string;
  campus?: string;
  cesResolution?: string;
  directorName?: string;
  directorEmail?: string;
  accreditations?: string[];
  mission?: string;
  vision?: string;
  objectives?: string[];
  graduateProfile?: string;
  professionalProfile?: string;
  curriculumPdfUrl?: string;
  curriculumDescription?: string;
  subjects?: string[];
  isActive?: boolean;
}

// Create a new career
export const createCareer = async (
  req: Request<{}, {}, CreateCareerBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      code,
      name,
      modality,
      duration,
      schedule,
      campus,
      cesResolution,
      directorName,
      directorEmail,
      accreditations,
      mission,
      vision,
      objectives,
      graduateProfile,
      professionalProfile,
      curriculumPdfUrl,
      curriculumDescription,
      subjects,
      isActive = true
    } = req.body;

    // Validate required fields
    if (!code || !name || !modality || !duration || !schedule || !campus || 
        !cesResolution || !directorName || !directorEmail || !mission || 
        !vision || !objectives || !graduateProfile || !professionalProfile || 
        !curriculumDescription || !subjects) {
      throw new AppError(400, 'All required fields must be provided');
    }

    // Validate duration
    if (duration <= 0 || duration > 20) {
      throw new AppError(400, 'Duration must be between 1 and 20 semesters');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(directorEmail)) {
      throw new AppError(400, 'Invalid director email format');
    }

    // Check if career code already exists
    const existingCareer = await prisma.career.findUnique({
      where: { code }
    });

    if (existingCareer) {
      throw new AppError(400, 'Career code already exists');
    }

    const career = await prisma.career.create({
      data: {
        code,
        name,
        modality,
        duration,
        schedule,
        campus,
        cesResolution,
        directorName,
        directorEmail,
        accreditations,
        mission,
        vision,
        objectives,
        graduateProfile,
        professionalProfile,
        curriculumPdfUrl,
        curriculumDescription,
        subjects,
        isActive
      }
    });

    res.status(201).json({
      status: 'success',
      data: { career }
    });
  } catch (error) {
    next(error);
  }
};

// Get all careers with filters
export const getCareers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      modality, 
      campus, 
      schedule, 
      isActive, 
      page = '1', 
      limit = '10' 
    } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};

    if (modality) {
      where.modality = modality;
    }

    if (campus) {
      where.campus = campus;
    }

    if (schedule) {
      where.schedule = schedule;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [careers, total] = await Promise.all([
      prisma.career.findMany({
        where,
        orderBy: {
          name: 'asc'
        },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.career.count({ where })
    ]);

    res.json({
      status: 'success',
      data: {
        careers,
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

// Get a single career by ID
export const getCareer = async (
  req: Request<{ careerId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { careerId } = req.params;

    const career = await prisma.career.findUnique({
      where: { id: careerId }
    });

    if (!career) {
      throw new AppError(404, 'Career not found');
    }

    res.json({
      status: 'success',
      data: { career }
    });
  } catch (error) {
    next(error);
  }
};

// Get a career by code
export const getCareerByCode = async (
  req: Request<{ code: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.params;

    const career = await prisma.career.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!career) {
      throw new AppError(404, 'Career not found');
    }

    res.json({
      status: 'success',
      data: { career }
    });
  } catch (error) {
    next(error);
  }
};

// Update a career
export const updateCareer = async (
  req: Request<{ careerId: string }, {}, UpdateCareerBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { careerId } = req.params;
    const updateData = req.body;

    // Check if career exists
    const existingCareer = await prisma.career.findUnique({
      where: { id: careerId }
    });

    if (!existingCareer) {
      throw new AppError(404, 'Career not found');
    }

    // Validate duration if provided
    if (updateData.duration !== undefined && (updateData.duration <= 0 || updateData.duration > 20)) {
      throw new AppError(400, 'Duration must be between 1 and 20 semesters');
    }

    // Validate email format if provided
    if (updateData.directorEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.directorEmail)) {
        throw new AppError(400, 'Invalid director email format');
      }
    }

    // Check if new code already exists (if code is being updated)
    if (updateData.code && updateData.code !== existingCareer.code) {
      const codeExists = await prisma.career.findUnique({
        where: { code: updateData.code }
      });

      if (codeExists) {
        throw new AppError(400, 'Career code already exists');
      }
    }

    const updatedCareer = await prisma.career.update({
      where: { id: careerId },
      data: updateData
    });

    res.json({
      status: 'success',
      data: { career: updatedCareer }
    });
  } catch (error) {
    next(error);
  }
};

// Delete a career
export const deleteCareer = async (
  req: Request<{ careerId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { careerId } = req.params;

    const career = await prisma.career.findUnique({
      where: { id: careerId }
    });

    if (!career) {
      throw new AppError(404, 'Career not found');
    }

    await prisma.career.delete({
      where: { id: careerId }
    });

    res.json({
      status: 'success',
      message: 'Career deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get careers by campus
export const getCareersByCampus = async (
  req: Request<{ campus: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { campus } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where = {
      campus: campus,
      isActive: true
    };

    const [careers, total] = await Promise.all([
      prisma.career.findMany({
        where,
        orderBy: {
          name: 'asc'
        },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.career.count({ where })
    ]);

    res.json({
      status: 'success',
      data: {
        careers,
        campus,
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

// Get careers by modality
export const getCareersByModality = async (
  req: Request<{ modality: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { modality } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where = {
      modality: modality,
      isActive: true
    };

    const [careers, total] = await Promise.all([
      prisma.career.findMany({
        where,
        orderBy: {
          name: 'asc'
        },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.career.count({ where })
    ]);

    res.json({
      status: 'success',
      data: {
        careers,
        modality,
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
