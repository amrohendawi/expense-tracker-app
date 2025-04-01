-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "autoSave" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "budgetAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "darkMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "weeklySummary" BOOLEAN NOT NULL DEFAULT true;
