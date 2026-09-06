import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AddTripPlaceDto } from './dto/add-trip-place.dto';
import { CreateTripDto } from './dto/create-trip.dto';
import { ReorderTripPlacesDto } from './dto/reorder-trip-places.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { ExpenseEstimate } from './entities/expense-estimate.entity';
import { TripPlaceSelection } from './entities/trip-place-selection.entity';
import { TripPlan } from './entities/trip-plan.entity';
import { RagService } from '../rag/rag.service';
import { GenerateTripDto } from './dto/generate-trip.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(TripPlan)
    private readonly tripRepo: Repository<TripPlan>,
    @InjectRepository(TripPlaceSelection)
    private readonly selectionRepo: Repository<TripPlaceSelection>,
    @InjectRepository(ExpenseEstimate)
    private readonly expenseRepo: Repository<ExpenseEstimate>,
    private readonly ragService: RagService,
  ) {}

  async create(userId: string, dto: CreateTripDto) {
    const trip = this.tripRepo.create({
      ...dto,
      userId,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
    const saved = await this.tripRepo.save(trip);
    await this.expenseRepo.save(
      this.expenseRepo.create({ tripPlanId: saved.id }),
    );
    return {
      EC: 0,
      EM: 'Trip created successfully',
      data: await this.findOwned(saved.id, userId),
    };
  }

  async generate(userId: string, dto: GenerateTripDto) {
    const docs = await this.ragService.retrieve(
      `${dto.destination}. ${dto.preferences || ''}`,
      Math.min(dto.days * 4, 10),
    );
    const stops = await this.ragService.generateItinerary(dto, docs);
    const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    const endDate = startDate
      ? new Date(startDate.getTime() + (dto.days - 1) * 86400000)
      : undefined;
    const trip = await this.tripRepo.save(
      this.tripRepo.create({
        userId,
        title: `${dto.destination} · ${dto.days} ngày`,
        budget: dto.budget,
        days: dto.days,
        preferences: dto.preferences,
        startDate,
        endDate,
      }),
    );
    if (stops.length) {
      const perDayOrder = new Map<number, number>();
      await this.selectionRepo.save(
        stops.map((stop) => {
          const orderIndex = perDayOrder.get(stop.dayNumber) ?? 0;
          perDayOrder.set(stop.dayNumber, orderIndex + 1);
          return this.selectionRepo.create({
            tripPlanId: trip.id,
            placeId: stop.placeId,
            dayNumber: stop.dayNumber,
            orderIndex,
            estimatedDuration: stop.estimatedDuration,
          });
        }),
      );
    }
    await this.expenseRepo.save(
      this.expenseRepo.create({ tripPlanId: trip.id }),
    );
    return {
      EC: 0,
      EM: stops.length
        ? 'AI itinerary generated'
        : 'Trip created; no matching indexed places found',
      data: await this.findOwned(trip.id, userId),
    };
  }

  async findAll(userId: string) {
    const trips = await this.tripRepo.find({
      where: { userId },
      relations: ['selections', 'selections.place', 'expenseEstimate'],
      order: { updatedAt: 'DESC' },
    });
    return { EC: 0, EM: 'Trips retrieved successfully', data: trips };
  }

  async findOne(id: string, userId: string) {
    return {
      EC: 0,
      EM: 'Trip retrieved successfully',
      data: await this.findOwned(id, userId),
    };
  }

  async update(id: string, userId: string, dto: UpdateTripDto) {
    const trip = await this.findOwned(id, userId);
    this.tripRepo.merge(trip, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : trip.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : trip.endDate,
    });
    await this.tripRepo.save(trip);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    const trip = await this.findOwned(id, userId);
    await this.tripRepo.remove(trip);
    return { EC: 0, EM: 'Trip deleted successfully', data: null };
  }

  async addPlace(id: string, userId: string, dto: AddTripPlaceDto) {
    await this.findOwned(id, userId);
    const duplicate = await this.selectionRepo.findOneBy({
      tripPlanId: id,
      placeId: dto.placeId,
    });
    if (duplicate)
      return { EC: 1, EM: 'Place is already in this trip', data: duplicate };
    const orderIndex =
      dto.orderIndex ??
      (await this.selectionRepo.countBy({
        tripPlanId: id,
        dayNumber: dto.dayNumber,
      }));
    const selection = await this.selectionRepo.save(
      this.selectionRepo.create({ ...dto, orderIndex, tripPlanId: id }),
    );
    return { EC: 0, EM: 'Place added to trip', data: selection };
  }

  async removePlace(id: string, selectionId: string, userId: string) {
    await this.findOwned(id, userId);
    const selection = await this.selectionRepo.findOneBy({
      id: selectionId,
      tripPlanId: id,
    });
    if (!selection) throw new NotFoundException('Trip place not found');
    await this.selectionRepo.remove(selection);
    return { EC: 0, EM: 'Place removed from trip', data: null };
  }

  async reorder(id: string, userId: string, dto: ReorderTripPlacesDto) {
    await this.findOwned(id, userId);
    if (dto.items.length === 0)
      return { EC: 0, EM: 'Itinerary unchanged', data: [] };
    const selections = await this.selectionRepo.findBy({
      id: In(dto.items.map((item) => item.id)),
      tripPlanId: id,
    });
    if (selections.length !== dto.items.length)
      throw new NotFoundException('One or more trip places were not found');
    const orderById = new Map(dto.items.map((item) => [item.id, item]));
    for (const selection of selections) {
      const order = orderById.get(selection.id)!;
      selection.dayNumber = order.dayNumber;
      selection.orderIndex = order.orderIndex;
    }
    await this.selectionRepo.save(selections);
    return { EC: 0, EM: 'Itinerary reordered', data: selections };
  }

  async optimizeDay(id: string, userId: string, dayNumber: number) {
    const trip = await this.findOwned(id, userId);
    const dayStops = trip.selections
      .filter((selection) => selection.dayNumber === dayNumber)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    if (dayStops.length < 3) {
      return {
        EC: 0,
        EM: 'The current order is already optimal',
        data: dayStops,
      };
    }

    const located = dayStops.filter(
      (selection) =>
        Number.isFinite(selection.place.latitude) &&
        Number.isFinite(selection.place.longitude),
    );
    const unlocated = dayStops.filter(
      (selection) => !located.includes(selection),
    );
    const ordered: TripPlaceSelection[] = [];
    if (located.length) {
      ordered.push(located.shift()!);
      while (located.length) {
        const current = ordered.at(-1)!;
        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;
        located.forEach((candidate, index) => {
          const distance = this.haversine(
            current.place.latitude,
            current.place.longitude,
            candidate.place.latitude,
            candidate.place.longitude,
          );
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });
        ordered.push(located.splice(nearestIndex, 1)[0]);
      }
    }
    ordered.push(...unlocated);
    ordered.forEach((selection, orderIndex) => {
      selection.orderIndex = orderIndex;
    });
    await this.selectionRepo.save(ordered);
    return { EC: 0, EM: 'Itinerary optimized by distance', data: ordered };
  }

  async updateExpense(id: string, userId: string, dto: UpdateExpenseDto) {
    await this.findOwned(id, userId);
    let expense = await this.expenseRepo.findOneBy({ tripPlanId: id });
    expense ??= this.expenseRepo.create({ tripPlanId: id });
    this.expenseRepo.merge(expense, dto);
    expense.totalCost =
      expense.transportCost +
      expense.hotelCost +
      expense.foodCost +
      expense.ticketCost +
      expense.otherCost;
    await this.expenseRepo.save(expense);
    await this.tripRepo.update(id, { estimatedCost: expense.totalCost });
    return { EC: 0, EM: 'Expense updated', data: expense };
  }

  async share(id: string, userId: string, enabled: boolean) {
    const trip = await this.findOwned(id, userId);
    trip.isPublic = enabled;
    trip.shareToken = enabled ? trip.shareToken || randomUUID() : null;
    await this.tripRepo.save(trip);
    return {
      EC: 0,
      EM: enabled ? 'Trip sharing enabled' : 'Trip sharing disabled',
      data: { isPublic: trip.isPublic, shareToken: trip.shareToken },
    };
  }

  async findPublic(token: string) {
    const trip = await this.tripRepo.findOne({
      where: { shareToken: token, isPublic: true },
      relations: ['selections', 'selections.place', 'expenseEstimate'],
      order: { selections: { dayNumber: 'ASC', orderIndex: 'ASC' } },
    });
    if (!trip) throw new NotFoundException('Shared trip not found');
    return { EC: 0, EM: 'Shared trip retrieved', data: trip };
  }

  private async findOwned(id: string, userId: string) {
    const trip = await this.tripRepo.findOne({
      where: { id, userId },
      relations: ['selections', 'selections.place', 'expenseEstimate'],
      order: { selections: { dayNumber: 'ASC', orderIndex: 'ASC' } },
    });
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const radians = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const deltaLat = radians(lat2 - lat1);
    const deltaLon = radians(lon2 - lon1);
    const value =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(radians(lat1)) *
        Math.cos(radians(lat2)) *
        Math.sin(deltaLon / 2) ** 2;
    return 2 * earthRadiusKm * Math.asin(Math.sqrt(value));
  }
}
