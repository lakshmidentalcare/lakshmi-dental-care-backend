import { AppController } from './app.controller';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { PrismaService } from './prisma.service';
import { PrismaModule } from './prisma.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthGuard } from './auth/auth.guard';

import { PatientsService } from './patients/patients.service';
import { PatientsController } from './patients/patients.controller';

import { OdontogramService } from './odontogram/odontogram.service';
import { OdontogramController } from './odontogram/odontogram.controller';
import { BillingModule } from './billing/billing.module';
import { InventoryModule } from './inventory/inventory.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { LabModule } from './lab/lab.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { ReportsModule } from './reports/reports.module';
import { TreatmentsModule } from './treatments/treatments.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'default-secret-key-change-in-prod',
      signOptions: { expiresIn: '1d' },
    }),
    BillingModule,
    InventoryModule,
    DashboardModule,
    AppointmentsModule,
    LabModule,
    PrescriptionsModule,
    ReportsModule,
    TreatmentsModule,
    PrismaModule,
  ],
  controllers: [
    AppController,
    AuthController,
    PatientsController,
    OdontogramController,
  ],
  providers: [
    AuthService,
    AuthGuard,
    PatientsService,
    OdontogramService,
    Reflector,
  ],
})
export class AppModule {}
