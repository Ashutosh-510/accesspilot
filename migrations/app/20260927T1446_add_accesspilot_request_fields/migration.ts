#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/0465f0db864d5dd0417c076399e4512a824b872d1d8e5f7e36b7408543112706/contract';
import startContract from '../../snapshots/0465f0db864d5dd0417c076399e4512a824b872d1d8e5f7e36b7408543112706/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/bbf92ff386e1b4cb1d75cbb9571ea2b379379b7b326a2b0c6380753ee532de2f/contract';
import endContract from '../../snapshots/bbf92ff386e1b4cb1d75cbb9571ea2b379379b7b326a2b0c6380753ee532de2f/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  placeholder,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'ApplicationAccess',
        columns: [
          col('application', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('employeeId', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'AccessRequest',
        column: col('applicationOwnerApproval', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-AccessRequest-applicationOwnerApproval', {
        check: () => placeholder('backfill-AccessRequest-applicationOwnerApproval:check'),
        run: () => placeholder('backfill-AccessRequest-applicationOwnerApproval:run'),
      }),
      this.setNotNull({
        schema: 'public',
        table: 'AccessRequest',
        column: 'applicationOwnerApproval',
      }),
      this.addColumn({
        schema: 'public',
        table: 'AccessRequest',
        column: col('managerApproval', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-AccessRequest-managerApproval', {
        check: () => placeholder('backfill-AccessRequest-managerApproval:check'),
        run: () => placeholder('backfill-AccessRequest-managerApproval:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'AccessRequest', column: 'managerApproval' }),
      this.addColumn({
        schema: 'public',
        table: 'AccessRequest',
        column: col('priority', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-AccessRequest-priority', {
        check: () => placeholder('backfill-AccessRequest-priority:check'),
        run: () => placeholder('backfill-AccessRequest-priority:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'AccessRequest', column: 'priority' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
