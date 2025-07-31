-- CreateTable
CREATE TABLE "public"."BankTransaction" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BankTransaction_pkey" PRIMARY KEY ("id")
);
