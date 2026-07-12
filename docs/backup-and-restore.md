# PostgreSQL backup and restore

Production must run a daily encrypted `pg_dump` and retain at least 14 daily and 3 monthly backups in a storage account separate from the database host. Media objects require a matching versioned-bucket retention policy.

## Backup

```bash
pg_dump --format=custom --no-owner --no-privileges "$DATABASE_URL" --file paketshop.dump
```

Record the application commit and migration version alongside every dump. Never place dumps in Git.

## Restore drill

Create an empty database, apply no application traffic, then run:

```bash
pg_restore --clean --if-exists --no-owner --no-privileges --dbname "$RESTORE_DATABASE_URL" paketshop.dump
```

After restoration, run `npm run db:validate`, application smoke tests, row-count checks for products/orders/leads, and verify a sample media object. A restore drill should be completed at least quarterly.
