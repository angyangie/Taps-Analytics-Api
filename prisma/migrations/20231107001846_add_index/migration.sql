-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "tagUid" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tap" (
    "id" SERIAL NOT NULL,
    "tagUid" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_token_key" ON "Team"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_tagUid_key" ON "Tag"("tagUid");

-- CreateIndex
CREATE INDEX "Tag_tagUid_idx" ON "Tag"("tagUid");

-- CreateIndex
CREATE INDEX "Tap_tagUid_created_at_idx" ON "Tap"("tagUid", "created_at");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tap" ADD CONSTRAINT "Tap_tagUid_fkey" FOREIGN KEY ("tagUid") REFERENCES "Tag"("tagUid") ON DELETE RESTRICT ON UPDATE CASCADE;
