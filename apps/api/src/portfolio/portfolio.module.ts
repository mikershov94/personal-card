import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ExperienceRepository } from './repositories/experience.repository';
import { ProfileRepository } from './repositories/profile.repository';
import { ProjectRepository } from './repositories/project.repository';
import { SkillRepository } from './repositories/skill.repository';
import { ExperienceResolver } from './resolvers/experience.resolver';
import { ProfileResolver } from './resolvers/profile.resolver';
import { ProjectResolver } from './resolvers/project.resolver';
import { SkillResolver } from './resolvers/skill.resolver';
import { ExperienceService } from './services/experience.service';
import { ProfileService } from './services/profile.service';
import { ProjectService } from './services/project.service';
import { SkillService } from './services/skill.service';

@Module({
    imports: [PrismaModule, AuthModule],
    providers: [
        ProfileRepository,
        ExperienceRepository,
        ProjectRepository,
        SkillRepository,
        ProfileService,
        ExperienceService,
        SkillService,
        ProjectService,
        ProfileResolver,
        ExperienceResolver,
        ProjectResolver,
        SkillResolver,
    ],
})
export class PortfolioModule {}
