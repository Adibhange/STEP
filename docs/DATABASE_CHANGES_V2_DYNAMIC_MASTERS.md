# Database Migration Documentation: V2 Dynamic Masters & Test Location Purge

**Migration Reference**: `V2_DYNAMIC_MASTERS_TEST_LOCATION_PURGE`  
**Target Database**: SQL Server / Azure SQL (`STEP_DB`)  
**Date**: 2026-08-22  

---

## 1. Summary of Changes

| Object | Type | Change Description |
| :--- | :--- | :--- |
| `master.MasterExperienceLevels` | Table | Added `MinYears DECIMAL(4,1) NOT NULL DEFAULT 0.0` and `MaxYears DECIMAL(4,1) NOT NULL DEFAULT 99.0`. |
| `master.MasterTestLocations` | Table | **DROPPED** (Purged legacy test venue taxonomy). |
| `dbo.VacancyTestLocations` / `vacancy.VacancyTestLocations` | Junction Table | **DROPPED** (Purged legacy vacancy-to-test-venue mapping). |
| Stored Procedures & Seed Data | SQL Routines | Updated `usp_CreateInstantDrive` and master seeds to reflect dynamic bounds and remove test location joins. |

---

## 2. SQL DDL Migration Script

```sql
-- =====================================================================================
-- STEP Enterprise V2 Migration: Dynamic Experience Masters & Test Location Removal
-- =====================================================================================

BEGIN TRANSACTION;
BEGIN TRY

    -- 1. Drop Foreign Key Constraints and Junction Table for VacancyTestLocations
    IF OBJECT_ID('dbo.VacancyTestLocations', 'U') IS NOT NULL
    BEGIN
        DROP TABLE dbo.VacancyTestLocations;
        PRINT '✓ Dropped dbo.VacancyTestLocations';
    END

    IF OBJECT_ID('vacancy.VacancyTestLocations', 'U') IS NOT NULL
    BEGIN
        DROP TABLE vacancy.VacancyTestLocations;
        PRINT '✓ Dropped vacancy.VacancyTestLocations';
    END

    -- 2. Drop master.MasterTestLocations Table
    IF OBJECT_ID('master.MasterTestLocations', 'U') IS NOT NULL
    BEGIN
        DROP TABLE master.MasterTestLocations;
        PRINT '✓ Dropped master.MasterTestLocations';
    END

    -- 3. Add MinYears and MaxYears to master.MasterExperienceLevels
    IF OBJECT_ID('master.MasterExperienceLevels', 'U') IS NOT NULL
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('master.MasterExperienceLevels') AND name = 'MinYears')
        BEGIN
            ALTER TABLE master.MasterExperienceLevels
            ADD MinYears DECIMAL(4,1) NOT NULL CONSTRAINT DF_MasterExperienceLevels_MinYears DEFAULT 0.0;
            PRINT '✓ Added MinYears to master.MasterExperienceLevels';
        END

        IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('master.MasterExperienceLevels') AND name = 'MaxYears')
        BEGIN
            ALTER TABLE master.MasterExperienceLevels
            ADD MaxYears DECIMAL(4,1) NOT NULL CONSTRAINT DF_MasterExperienceLevels_MaxYears DEFAULT 99.0;
            PRINT '✓ Added MaxYears to master.MasterExperienceLevels';
        END

        -- Populate numerical values for existing standard seed rows
        UPDATE master.MasterExperienceLevels SET MinYears = 0.0, MaxYears = 0.0 WHERE Code = 'EXP-0';
        UPDATE master.MasterExperienceLevels SET MinYears = 0.0, MaxYears = 1.0 WHERE Code = 'EXP-1';
        UPDATE master.MasterExperienceLevels SET MinYears = 1.0, MaxYears = 3.0 WHERE Code = 'EXP-3';
        UPDATE master.MasterExperienceLevels SET MinYears = 3.0, MaxYears = 5.0 WHERE Code = 'EXP-5';
        UPDATE master.MasterExperienceLevels SET MinYears = 5.0, MaxYears = 8.0 WHERE Code = 'EXP-8';
        UPDATE master.MasterExperienceLevels SET MinYears = 8.0, MaxYears = 99.0 WHERE Code IN ('EXP-8P', 'EXP-8+');
        PRINT '✓ Updated default experience level numerical ranges';
    END

    COMMIT TRANSACTION;
    PRINT '✓ Migration V2_DYNAMIC_MASTERS_TEST_LOCATION_PURGE completed successfully.';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
    RAISERROR('Migration failed: %s', 16, 1, @ErrMsg);
END CATCH;
GO
```

---

## 3. Rollback Script (If Required)

```sql
BEGIN TRANSACTION;
BEGIN TRY
    -- 1. Remove columns from MasterExperienceLevels
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('master.MasterExperienceLevels') AND name = 'MinYears')
    BEGIN
        ALTER TABLE master.MasterExperienceLevels DROP CONSTRAINT DF_MasterExperienceLevels_MinYears;
        ALTER TABLE master.MasterExperienceLevels DROP COLUMN MinYears;
    END

    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('master.MasterExperienceLevels') AND name = 'MaxYears')
    BEGIN
        ALTER TABLE master.MasterExperienceLevels DROP CONSTRAINT DF_MasterExperienceLevels_MaxYears;
        ALTER TABLE master.MasterExperienceLevels DROP COLUMN MaxYears;
    END

    -- 2. Recreate master.MasterTestLocations
    IF OBJECT_ID('master.MasterTestLocations', 'U') IS NULL
    BEGIN
        CREATE TABLE master.MasterTestLocations (
            MasterTestLocationId INT IDENTITY(1,1) PRIMARY KEY,
            Name NVARCHAR(100) NOT NULL,
            Code NVARCHAR(30) NOT NULL UNIQUE,
            Description NVARCHAR(500) NULL,
            IsActive BIT NOT NULL DEFAULT 1,
            IsDeleted BIT NOT NULL DEFAULT 0,
            CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
            CreatedBy NVARCHAR(100) NULL,
            ModifiedAt DATETIME2 NULL,
            ModifiedBy NVARCHAR(100) NULL
        );
    END

    COMMIT TRANSACTION;
    PRINT '✓ Rollback completed successfully.';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
```
