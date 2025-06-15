
import { differenceInMinutes } from "date-fns";
export function isNewJoiner(joinDate?: string) {
  if (!joinDate) return false;
  const diff = differenceInMinutes(new Date(), new Date(joinDate));
  return diff <= 60;
}
