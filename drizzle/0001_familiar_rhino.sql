CREATE TABLE "email_verification_codes" (
	"email" varchar(254) NOT NULL,
	"purpose" varchar(16) NOT NULL,
	"code_hash" varchar(64) NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "email_verification_codes_email_purpose_pk" PRIMARY KEY("email","purpose"),
	CONSTRAINT "email_verification_codes_purpose" CHECK ("email_verification_codes"."purpose" IN ('register', 'password_reset'))
);
--> statement-breakpoint
CREATE INDEX "email_verification_codes_expiry_idx" ON "email_verification_codes" USING btree ("expires_at");