import { prisma } from "@/lib/prisma";

interface StackUser {
  id: string;
  primaryEmail: string | null;
  displayName: string | null;
}

function sanitizeUsername(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
}

function buildBaseUsername(stackUser: StackUser): string {
  const fromDisplayName = stackUser.displayName
    ? sanitizeUsername(stackUser.displayName)
    : "";
  if (fromDisplayName) return fromDisplayName;

  const fromEmail = stackUser.primaryEmail
    ? sanitizeUsername(stackUser.primaryEmail.split("@")[0] || "")
    : "";
  if (fromEmail) return fromEmail;

  return `user_${stackUser.id.slice(0, 8).toLowerCase()}`;
}

function buildBaseEmail(stackUser: StackUser): string {
  if (stackUser.primaryEmail && stackUser.primaryEmail.includes("@")) {
    return stackUser.primaryEmail.toLowerCase();
  }

  return `${stackUser.id.toLowerCase()}@stack.local`;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

/**
 * Ensures a User record exists in the database for the given Stack Auth user.
 * Creates the user with default Profile and GameStats if not found.
 * Returns the user with profile and gameStats included.
 */
export async function ensureUserExists(stackUser: StackUser) {
  const existingUser = await prisma.user.findUnique({
    where: { stackId: stackUser.id },
    include: {
      profile: true,
      gameStats: true,
    },
  });

  if (existingUser) {
    if (!existingUser.profile) {
      await prisma.userProfile.create({ data: { userId: existingUser.id } });
    }

    if (!existingUser.gameStats) {
      await prisma.gameStats.create({ data: { userId: existingUser.id } });
    }

    return prisma.user.findUniqueOrThrow({
      where: { stackId: stackUser.id },
      include: {
        profile: true,
        gameStats: true,
      },
    });
  }

  const baseUsername = buildBaseUsername(stackUser);
  const baseEmail = buildBaseEmail(stackUser);

  // Retry a few times in case username/email collides with existing records.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = attempt === 0 ? "" : `_${Math.floor(Math.random() * 10000)}`;
    const username = `${baseUsername}${suffix}`.slice(0, 28);
    const email =
      attempt === 0
        ? baseEmail
        : `${stackUser.id.toLowerCase()}_${attempt}@stack.local`;

    try {
      return await prisma.user.create({
        data: {
          stackId: stackUser.id,
          email,
          username,
          displayName: stackUser.displayName || null,
          profile: {
            create: {},
          },
          gameStats: {
            create: {},
          },
        },
        include: {
          profile: true,
          gameStats: true,
        },
      });
    } catch (error) {
      if (!isUniqueConstraintError(error) || attempt === 4) {
        throw error;
      }
    }
  }

  // Defensive fallback: loop should always return or throw.
  return prisma.user.create({
    data: {
      stackId: stackUser.id,
      email: `${stackUser.id.toLowerCase()}@stack.local`,
      username: `user_${Date.now()}`,
      displayName: stackUser.displayName || null,
      profile: {
        create: {},
      },
      gameStats: {
        create: {},
      },
    },
    include: {
      profile: true,
      gameStats: true,
    },
  });
}
