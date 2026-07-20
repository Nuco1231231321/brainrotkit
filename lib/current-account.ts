import { cache } from "react";
import { getAccount } from "@/lib/accounts";
import { getSessionUserId } from "@/lib/session";

export const getCurrentAccount = cache(async () => {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const account = await getAccount(userId);
  if (!account) throw new Error("Authenticated BrainrotKit account was not found.");

  return { userId, account };
});
