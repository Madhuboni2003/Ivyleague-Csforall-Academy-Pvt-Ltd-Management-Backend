import { Injectable } from '@nestjs/common';

import { LearnerRepository } from './learner.repository.js';

@Injectable()
export class LearnerService {
    constructor(
        private readonly learnerRepository: LearnerRepository,
    ) {}

    findAtRisk() {
        return this.learnerRepository.findAtRisk();
    }
}