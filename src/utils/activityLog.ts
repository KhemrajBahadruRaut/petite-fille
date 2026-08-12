import { apiUrl } from "./api";
import { getAdminSession } from "./adminAuth";

/**
 * Log an admin activity to the backend. Fire-and-forget — failures are
 * silently ignored so they never disrupt the main page flow.
 *
 * @param section  e.g. "Content Management", "Orders", "Contacts", "Gift Cards", "Reservations", "Settings"
 * @param action   e.g. "Updated order status", "Deleted reservation"
 * @param details  Optional extra info, e.g. "Order #42 → shipped"
 */
export function logAdminActivity(
  section: string,
  action: string,
  details = "",
): void {
  const session = getAdminSession();
  if (!session?.email) return;

  fetch(apiUrl("admin/log_activity.php"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      admin_email: session.email,
      section,
      action,
      details,
    }),
  }).catch(() => {
    // Silent — activity logging should never disrupt admin workflows.
  });
}
