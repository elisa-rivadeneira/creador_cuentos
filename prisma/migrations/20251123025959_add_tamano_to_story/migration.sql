-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Story" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "ideas" TEXT,
    "grado" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "formatoImagen" TEXT NOT NULL DEFAULT 'cabecera',
    "tamano" TEXT NOT NULL DEFAULT 'corto',
    "cuentoUrl" TEXT,
    "fichaUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Story_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Story" ("area", "createdAt", "cuentoUrl", "fichaUrl", "formatoImagen", "grado", "id", "ideas", "tema", "updatedAt", "userId") SELECT "area", "createdAt", "cuentoUrl", "fichaUrl", "formatoImagen", "grado", "id", "ideas", "tema", "updatedAt", "userId" FROM "Story";
DROP TABLE "Story";
ALTER TABLE "new_Story" RENAME TO "Story";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
