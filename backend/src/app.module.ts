import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthorModule } from './catalog/authors/author.module';
import { BookModule } from './catalog/books/book.module';
import { CopyModule } from './inventory/copies/copy.module';
import { WriteOffModule } from './inventory/write-offs/writeoff.module';
import { SupplierModule } from './procurement/suppliers/supplier.module';
import { PurchaseRequestModule } from './procurement/purchase-requests/pr.module';
import { OrderModule } from './procurement/orders/order.module';
import { AcquisitionModule } from './acquisitions/acquisition.module';
import { DonationModule } from './donations/donation.module';
import { CoverageModule } from './coverage/coverage.module';
import { UserModule } from './users/user.module';
import { AuditService } from './common/audit.service';
import { PrismaService } from './common/prisma.service';
import { ReportingModule } from './reporting/reporting.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    AuthorModule,
    BookModule,
    CopyModule,
    WriteOffModule,
    SupplierModule,
    PurchaseRequestModule,
    OrderModule,
    AcquisitionModule,
    DonationModule,
    CoverageModule,
    UserModule,
    ReportingModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, AuditService],
})
export class AppModule {}
