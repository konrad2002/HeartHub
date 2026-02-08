import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PrismaService } from '../prisma/prisma.service';

const issuer = process.env.KEYCLOAK_ISSUER ?? '';
const audience = process.env.KEYCLOAK_AUDIENCE ?? '';
const jwksUrl = issuer
  ? new URL(`${issuer.replace(/\/$/, '')}/protocol/openid-connect/certs`)
  : null;
const jwks = jwksUrl ? createRemoteJWKSet(jwksUrl) : null;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string | undefined;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    if (!jwks || !issuer) {
      throw new UnauthorizedException('Keycloak issuer not configured');
    }

    const token = authHeader.slice('Bearer '.length).trim();
    const verifyOptions = audience ? { issuer, audience } : { issuer };
    const { payload } = await jwtVerify(token, jwks, verifyOptions);
    const subject = typeof payload.sub === 'string' ? payload.sub : undefined;
    const email = typeof payload.email === 'string' ? payload.email : undefined;
    const name =
      typeof payload.name === 'string'
        ? payload.name
        : typeof payload.preferred_username === 'string'
          ? payload.preferred_username
          : undefined;

    if (!subject || !email) {
      throw new UnauthorizedException('Token missing subject or email');
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
