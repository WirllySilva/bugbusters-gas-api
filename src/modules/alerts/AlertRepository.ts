import { AppDataSource } from '../../database/data-source'
import { Alert } from './Alert'

const repository = AppDataSource.getRepository(Alert)

export const AlertRepository = {
  create(data: Partial<Alert>) {
    const alert = repository.create(data)
    return repository.save(alert)
  },

  findAll() {
    return repository.find({
      order: { createdAt: 'DESC' },
    })
  },
}
