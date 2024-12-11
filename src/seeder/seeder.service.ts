import { User } from '#/users/entities/user.entity';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';
import { defaultUserData } from './data/user';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private logger = new Logger(SeederService.name);

  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  private async seedUser() {
    const userRepository = this.dataSource.getRepository(User);

    for (const user of defaultUserData) {
      
      const existingUser = await userRepository.findOne({
        where: { username: user.username },
      });

      if (!existingUser) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(this.configService.get('user.password'), salt);

        const newUser = new User();

        newUser.username = user.username;
        newUser.password = hashedPassword;
        newUser.salt = salt;

        await userRepository.insert(newUser);

        this.logger.log(`Created user ${user.username}`);
      }
    }
  }

  async onApplicationBootstrap() {
    if (this.configService.get('env') === 'development') {
      await this.seedUser();
      this.logger.log('Seeder run successfully');
    }
  }
}
