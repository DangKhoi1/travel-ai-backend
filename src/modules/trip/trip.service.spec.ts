import { Repository } from 'typeorm';
import { RagService } from '../rag/rag.service';
import { ExpenseEstimate } from './entities/expense-estimate.entity';
import { TripPlaceSelection } from './entities/trip-place-selection.entity';
import { TripPlan } from './entities/trip-plan.entity';
import { TripService } from './trip.service';

describe('TripService', () => {
  it('orders a day by the nearest next stop', async () => {
    const stop = (id: string, longitude: number, orderIndex: number) =>
      ({
        id,
        dayNumber: 1,
        orderIndex,
        place: { latitude: 0, longitude },
      }) as TripPlaceSelection;
    const trip = {
      selections: [stop('start', 0, 0), stop('far', 10, 1), stop('near', 1, 2)],
    } as TripPlan;
    const tripRepo = { findOne: jest.fn().mockResolvedValue(trip) };
    const selectionRepo = {
      save: jest
        .fn()
        .mockImplementation((value: TripPlaceSelection[]) =>
          Promise.resolve(value),
        ),
    };
    const service = new TripService(
      tripRepo as unknown as Repository<TripPlan>,
      selectionRepo as unknown as Repository<TripPlaceSelection>,
      {} as Repository<ExpenseEstimate>,
      {} as RagService,
    );

    const result = await service.optimizeDay('trip-1', 'user-1', 1);

    expect(result.data.map((selection) => selection.id)).toEqual([
      'start',
      'near',
      'far',
    ]);
    expect(selectionRepo.save).toHaveBeenCalled();
  });
});
