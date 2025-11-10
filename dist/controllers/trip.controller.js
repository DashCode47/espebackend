"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateDriver = exports.getUserTrips = exports.confirmPassenger = exports.joinTrip = exports.cancelTrip = exports.updateTrip = exports.createTrip = exports.getTripById = exports.getTrips = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../utils/prisma");
const errorHandler_1 = require("../middlewares/errorHandler");
const notification_controller_1 = require("./notification.controller");
const role_middleware_1 = require("../middlewares/role.middleware");
// GET /api/trips - Listar viajes activos con filtros opcionales
const getTrips = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { origin, destination, date, page = '1', limit = '20' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {
            status: client_1.TripStatus.ACTIVE
        };
        if (origin) {
            where.origin = { contains: origin, mode: 'insensitive' };
        }
        if (destination) {
            where.destination = { contains: destination, mode: 'insensitive' };
        }
        // Filtro de fecha de salida
        const now = new Date();
        if (date) {
            const dateObj = new Date(date);
            const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
            const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
            // Asegurar que la fecha filtrada no sea en el pasado
            where.departureTime = {
                gte: startOfDay > now ? startOfDay : now,
                lte: endOfDay
            };
        }
        else {
            // No mostrar viajes pasados si no hay filtro de fecha
            where.departureTime = {
                gte: now
            };
        }
        const [trips, total] = yield Promise.all([
            prisma_1.prisma.trip.findMany({
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
                        where: { status: client_1.TripRequestStatus.ACCEPTED },
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
                take: parseInt(limit)
            }),
            prisma_1.prisma.trip.count({ where })
        ]);
        // Calcular rating promedio del conductor para cada viaje
        const tripsWithRating = trips.map(trip => {
            const ratings = trip.ratings.map(r => r.rating);
            const avgRating = ratings.length > 0
                ? ratings.reduce((a, b) => a + b, 0) / ratings.length
                : null;
            return Object.assign(Object.assign({}, trip), { driver: Object.assign(Object.assign({}, trip.driver), { averageRating: avgRating, totalRatings: ratings.length }) });
        });
        res.json({
            status: 'success',
            data: {
                trips: tripsWithRating,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getTrips = getTrips;
// GET /api/trips/:id - Obtener detalle de un viaje
const getTripById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const trip = yield prisma_1.prisma.trip.findUnique({
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
            throw new errorHandler_1.AppError(404, 'Trip not found');
        }
        // Calcular rating promedio del conductor
        const ratings = trip.ratings.map(r => r.rating);
        const avgRating = ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : null;
        res.json({
            status: 'success',
            data: {
                trip: Object.assign(Object.assign({}, trip), { driver: Object.assign(Object.assign({}, trip.driver), { averageRating: avgRating, totalRatings: ratings.length }) })
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getTripById = getTripById;
// POST /api/trips - Crear viaje (solo DRIVER)
const createTrip = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const { origin, destination, departureTime, availableSeats, price, notes } = req.body;
        // Validaciones
        if (!origin || !destination || !departureTime || !availableSeats) {
            throw new errorHandler_1.AppError(400, 'Origin, destination, departureTime, and availableSeats are required');
        }
        if (availableSeats < 1) {
            throw new errorHandler_1.AppError(400, 'Available seats must be at least 1');
        }
        const departureDate = new Date(departureTime);
        if (departureDate < new Date()) {
            throw new errorHandler_1.AppError(400, 'Departure time cannot be in the past');
        }
        // Verificar que el usuario es DRIVER
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: userId }
        });
        // @ts-ignore - role exists in database after migration
        if (!user || user.role !== role_middleware_1.UserRole.STUDENT && user.role !== role_middleware_1.UserRole.DRIVER) {
            throw new errorHandler_1.AppError(403, 'Only students and drivers can create trips');
        }
        // Verificar si ya existe un viaje activo del mismo conductor en la misma fecha/hora
        const existingTrip = yield prisma_1.prisma.trip.findFirst({
            where: {
                driverId: userId,
                status: client_1.TripStatus.ACTIVE,
                departureTime: {
                    gte: new Date(departureDate.getTime() - 2 * 60 * 60 * 1000), // 2 horas antes
                    lte: new Date(departureDate.getTime() + 2 * 60 * 60 * 1000) // 2 horas después
                }
            }
        });
        if (existingTrip) {
            throw new errorHandler_1.AppError(409, 'You already have an active trip at this time');
        }
        const trip = yield prisma_1.prisma.trip.create({
            data: {
                driverId: userId,
                origin,
                destination,
                departureTime: departureDate,
                availableSeats,
                price: price || null,
                notes: notes || null,
                status: client_1.TripStatus.ACTIVE
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
    }
    catch (error) {
        next(error);
    }
});
exports.createTrip = createTrip;
// PUT /api/trips/:id - Actualizar viaje (solo creador)
const updateTrip = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { id } = req.params;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const trip = yield prisma_1.prisma.trip.findUnique({
            where: { id }
        });
        if (!trip) {
            throw new errorHandler_1.AppError(404, 'Trip not found');
        }
        if (trip.driverId !== userId) {
            throw new errorHandler_1.AppError(403, 'Only the trip creator can update it');
        }
        if (trip.status === client_1.TripStatus.CANCELLED) {
            throw new errorHandler_1.AppError(400, 'Cannot update a cancelled trip');
        }
        const { origin, destination, departureTime, availableSeats, price, notes } = req.body;
        const updateData = {};
        if (origin)
            updateData.origin = origin;
        if (destination)
            updateData.destination = destination;
        if (departureTime) {
            const departureDate = new Date(departureTime);
            if (departureDate < new Date()) {
                throw new errorHandler_1.AppError(400, 'Departure time cannot be in the past');
            }
            updateData.departureTime = departureDate;
        }
        if (availableSeats !== undefined) {
            if (availableSeats < 1) {
                throw new errorHandler_1.AppError(400, 'Available seats must be at least 1');
            }
            // Verificar que no se reduzcan los asientos por debajo de los pasajeros aceptados
            const acceptedRequests = yield prisma_1.prisma.tripRequest.count({
                where: {
                    tripId: id,
                    status: client_1.TripRequestStatus.ACCEPTED
                }
            });
            if (availableSeats < acceptedRequests) {
                throw new errorHandler_1.AppError(400, `Cannot reduce seats below ${acceptedRequests} accepted passengers`);
            }
            updateData.availableSeats = availableSeats;
        }
        if (price !== undefined)
            updateData.price = price;
        if (notes !== undefined)
            updateData.notes = notes;
        const updatedTrip = yield prisma_1.prisma.trip.update({
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
    }
    catch (error) {
        next(error);
    }
});
exports.updateTrip = updateTrip;
// DELETE /api/trips/:id - Cancelar viaje
const cancelTrip = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { id } = req.params;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const trip = yield prisma_1.prisma.trip.findUnique({
            where: { id },
            include: {
                requests: {
                    where: { status: client_1.TripRequestStatus.ACCEPTED },
                    include: {
                        passenger: {
                            select: { id: true }
                        }
                    }
                }
            }
        });
        if (!trip) {
            throw new errorHandler_1.AppError(404, 'Trip not found');
        }
        if (trip.driverId !== userId) {
            throw new errorHandler_1.AppError(403, 'Only the trip creator can cancel it');
        }
        if (trip.status === client_1.TripStatus.CANCELLED) {
            throw new errorHandler_1.AppError(400, 'Trip is already cancelled');
        }
        // Actualizar el viaje a CANCELLED
        const cancelledTrip = yield prisma_1.prisma.trip.update({
            where: { id },
            data: { status: client_1.TripStatus.CANCELLED }
        });
        // Rechazar todas las solicitudes pendientes
        yield prisma_1.prisma.tripRequest.updateMany({
            where: {
                tripId: id,
                status: client_1.TripRequestStatus.PENDING
            },
            data: {
                status: client_1.TripRequestStatus.REJECTED
            }
        });
        // Notificar a los pasajeros aceptados
        for (const request of trip.requests) {
            yield (0, notification_controller_1.createNotification)(request.passenger.id, `El viaje a ${trip.destination} ha sido cancelado por el conductor.`);
        }
        res.json({
            status: 'success',
            message: 'Trip cancelled successfully',
            data: { trip: cancelledTrip }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.cancelTrip = cancelTrip;
// POST /api/trips/:id/join - Unirse a un viaje
const joinTrip = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { id } = req.params;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const trip = yield prisma_1.prisma.trip.findUnique({
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
            throw new errorHandler_1.AppError(404, 'Trip not found');
        }
        if (trip.status !== client_1.TripStatus.ACTIVE) {
            throw new errorHandler_1.AppError(400, 'Trip is not active');
        }
        if (trip.driverId === userId) {
            throw new errorHandler_1.AppError(400, 'Driver cannot join their own trip');
        }
        // Verificar si ya existe una solicitud
        if (trip.requests.length > 0) {
            const existingRequest = trip.requests[0];
            if (existingRequest.status === client_1.TripRequestStatus.PENDING) {
                throw new errorHandler_1.AppError(409, 'You already have a pending request for this trip');
            }
            if (existingRequest.status === client_1.TripRequestStatus.ACCEPTED) {
                throw new errorHandler_1.AppError(409, 'You are already accepted in this trip');
            }
        }
        // Crear solicitud
        const request = yield prisma_1.prisma.tripRequest.create({
            data: {
                tripId: id,
                passengerId: userId,
                status: client_1.TripRequestStatus.PENDING
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
        yield (0, notification_controller_1.createNotification)(trip.driver.id, `${request.passenger.name} quiere unirse a tu viaje a ${trip.destination}`);
        res.status(201).json({
            status: 'success',
            message: 'Trip request created successfully',
            data: { request }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.joinTrip = joinTrip;
// POST /api/trips/:id/confirm - Conductor acepta pasajero
const confirmPassenger = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { id } = req.params;
        const { requestId } = req.body;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        if (!requestId) {
            throw new errorHandler_1.AppError(400, 'requestId is required');
        }
        const trip = yield prisma_1.prisma.trip.findUnique({
            where: { id },
            include: {
                requests: {
                    where: { status: client_1.TripRequestStatus.ACCEPTED }
                }
            }
        });
        if (!trip) {
            throw new errorHandler_1.AppError(404, 'Trip not found');
        }
        if (trip.driverId !== userId) {
            throw new errorHandler_1.AppError(403, 'Only the trip driver can confirm passengers');
        }
        if (trip.status !== client_1.TripStatus.ACTIVE) {
            throw new errorHandler_1.AppError(400, 'Trip is not active');
        }
        const request = yield prisma_1.prisma.tripRequest.findUnique({
            where: { id: requestId },
            include: {
                passenger: {
                    select: { id: true, name: true }
                }
            }
        });
        if (!request) {
            throw new errorHandler_1.AppError(404, 'Trip request not found');
        }
        if (request.tripId !== id) {
            throw new errorHandler_1.AppError(400, 'Request does not belong to this trip');
        }
        if (request.status !== client_1.TripRequestStatus.PENDING) {
            throw new errorHandler_1.AppError(400, 'Request is not pending');
        }
        // Verificar que hay asientos disponibles
        const acceptedCount = trip.requests.length;
        if (acceptedCount >= trip.availableSeats) {
            throw new errorHandler_1.AppError(400, 'Trip is full');
        }
        // Aceptar la solicitud
        const updatedRequest = yield prisma_1.prisma.tripRequest.update({
            where: { id: requestId },
            data: { status: client_1.TripRequestStatus.ACCEPTED },
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
        let updatedTrip = trip;
        if (newAcceptedCount >= trip.availableSeats) {
            updatedTrip = yield prisma_1.prisma.trip.update({
                where: { id },
                data: { status: client_1.TripStatus.FULL },
                include: {
                    requests: {
                        where: { status: client_1.TripRequestStatus.ACCEPTED }
                    }
                }
            });
        }
        // Notificar al pasajero
        yield (0, notification_controller_1.createNotification)(request.passenger.id, `Tu solicitud para el viaje a ${trip.destination} ha sido aceptada!`);
        res.json({
            status: 'success',
            message: 'Passenger confirmed successfully',
            data: {
                request: updatedRequest,
                trip: updatedTrip
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.confirmPassenger = confirmPassenger;
// GET /api/users/:id/trips - Listar viajes creados o reservados por un usuario
const getUserTrips = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { type = 'all' } = req.query; // 'created', 'joined', 'all'
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id }
        });
        if (!user) {
            throw new errorHandler_1.AppError(404, 'User not found');
        }
        let trips = [];
        if (type === 'created' || type === 'all') {
            const createdTrips = yield prisma_1.prisma.trip.findMany({
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
            trips = [...trips, ...createdTrips.map(t => (Object.assign(Object.assign({}, t), { userRole: 'driver' })))];
        }
        if (type === 'joined' || type === 'all') {
            const joinedRequests = yield prisma_1.prisma.tripRequest.findMany({
                where: {
                    passengerId: id,
                    status: client_1.TripRequestStatus.ACCEPTED
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
            trips = [...trips, ...joinedRequests.map(r => (Object.assign(Object.assign({}, r.trip), { userRole: 'passenger' })))];
        }
        // Eliminar duplicados si type === 'all'
        if (type === 'all') {
            const uniqueTrips = trips.reduce((acc, trip) => {
                if (!acc.find((t) => t.id === trip.id)) {
                    acc.push(trip);
                }
                return acc;
            }, []);
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
    }
    catch (error) {
        next(error);
    }
});
exports.getUserTrips = getUserTrips;
// POST /api/trips/:id/rating - Calificar conductor
const rateDriver = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { id } = req.params;
        const { rating, comment } = req.body;
        if (!userId) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        if (!rating || rating < 1 || rating > 5) {
            throw new errorHandler_1.AppError(400, 'Rating must be between 1 and 5');
        }
        const trip = yield prisma_1.prisma.trip.findUnique({
            where: { id },
            include: {
                driver: {
                    select: { id: true }
                }
            }
        });
        if (!trip) {
            throw new errorHandler_1.AppError(404, 'Trip not found');
        }
        // Verificar que el usuario fue pasajero aceptado en este viaje
        const request = yield prisma_1.prisma.tripRequest.findFirst({
            where: {
                tripId: id,
                passengerId: userId,
                status: client_1.TripRequestStatus.ACCEPTED
            }
        });
        if (!request) {
            throw new errorHandler_1.AppError(403, 'You can only rate trips you participated in');
        }
        // Verificar si ya calificó
        const existingRating = yield prisma_1.prisma.tripRating.findUnique({
            where: {
                tripId_raterId: {
                    tripId: id,
                    raterId: userId
                }
            }
        });
        if (existingRating) {
            throw new errorHandler_1.AppError(409, 'You have already rated this trip');
        }
        const tripRating = yield prisma_1.prisma.tripRating.create({
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
    }
    catch (error) {
        next(error);
    }
});
exports.rateDriver = rateDriver;
