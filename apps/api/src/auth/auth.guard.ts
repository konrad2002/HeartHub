import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const subject = request.headers['x-user-sub'] as string | undefined;
    const email = request.headers['x-user-email'] as string | undefined;
    const name = request.headers['x-user-name'] as string | undefined;

    if (!subject || !email) {
      throw new UnauthorizedException('Missing user headers');
    }

    const user = await this.prisma.user.upsert({
      where: { keycloakSubject: subject },
      update: { email, name: name ?? null },
      create: { keycloakSubject: subject, email, name: name ?? null },
    });

    request.user = {
      id: user.id,
      subject: user.keycloakSubject,
      email: user.email,
      name: user.name,
    };

    return true;
  }
}
