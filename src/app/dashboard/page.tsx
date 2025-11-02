import { finishOnboarding } from "@/actions/onboarding";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export default async function DashboardPage() {
  // 1️⃣ Get the session
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    // Not logged in, redirect to login
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Not logged in</h2>
        <p>
          Please{" "}
          <a className="text-blue-500 underline" href="/login">
            login
          </a>{" "}
          first.
        </p>
      </div>
    );
  }

  // 2️⃣ Ensure default habits exist for new users
  await finishOnboarding();

  // 3️⃣ Fetch habits
  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {session.user.email}!
      </h1>

      {habits.length === 0 ? (
        <p className="text-gray-500">You don’t have any habits yet.</p>
      ) : (
        <ul className="space-y-4">
          {habits.map((habit) => (
            <li
              key={habit.id}
              className="p-4 border rounded-lg flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">{habit.title}</h2>
                {habit.description && (
                  <p className="text-gray-500 text-sm">{habit.description}</p>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {habit.frequency}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
