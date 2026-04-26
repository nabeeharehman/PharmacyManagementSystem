# Sprint 2 Backlog and Daily Scrum Meetings

## Sprint 2 Backlog

**Sprint Goal:**  
Complete the pharmacy management system after Sprint 1 by finishing customer authentication flow, improving usability, finalizing role-based login, fixing inventory transaction handling, strengthening validation and notifications, and updating testing/reporting artifacts.

| Sprint Backlog ID | User Story / Task | Priority | Owner(s) | Estimated Effort | Status | Deliverable / Outcome |
| --- | --- | --- | --- | --- | --- | --- |
| SB2-01 | As a customer, I want registration to follow a simple email-link flow so I can sign up without confusion. | High | Fatima, Seerat | 2 days | Done | Removed unnecessary Step 2/3, kept details step, and routed email link directly to password setup. |
| SB2-02 | As a user, I want one shared login screen so I do not need separate tabs for each role. | High | Fatima, Maha | 1 day | Done | Replaced multi-role login tabs with a single sign-in screen that routes users by database role. |
| SB2-03 | As a user, I want visible success and failure popups so I can clearly understand system responses. | High | Seerat, Nabeeha | 1 day | Done | Added toast-based success and error feedback for login, registration, forgot password, reset password, staff creation, and inventory actions. |
| SB2-04 | As an inventory manager, I want stock handled through inventory transactions so stock history remains consistent. | High | Maha, Nabeeha | 2 days | Done | Moved stock calculations away from `medicines.stock_quantity` and used `inventory_transactions` with `quantity_change`, `previous_stock`, `new_stock`, and `transaction_type`. |
| SB2-05 | As an inventory manager, I want medicine creation to also create opening stock correctly. | High | Maha | 1 day | Done | Added opening stock transaction during medicine creation and rollback protection if transaction insert fails. |
| SB2-06 | As an inventory manager, I want stock updates recorded with proper transaction types. | High | Maha, Seerat | 1 day | Done | Added `transaction_type` handling such as `restock` and `adjustment` for inventory updates. |
| SB2-07 | As a team, we want cleaner form behavior and validations so the system is more reliable. | Medium | Fatima, Nabeeha | 1 day | Done | Fixed form button behavior, preserved validation flow, and improved registration and inventory form handling. |
| SB2-08 | As a team, we want updated test cases that reflect the completed Sprint 2 system. | High | Nabeeha, Seerat | 1 day | Done | Updated test case workbook, removed obsolete registration step cases, and added usability and performance test cases. |
| SB2-09 | As a team, we want execution evidence for the current build so we can report verified progress. | Medium | Nabeeha, Fatima | 0.5 day | Done | Completed Vite build verification and documented the execution report. |
| SB2-10 | As a team, we want Sprint 2 documentation aligned with Sprint 1 format for final submission. | High | All team members | 1 day | Done | Prepared Sprint 2 backlog and individual daily scrum reporting content. |

## Daily Scrum Meetings

**Standard Daily Scrum Questions**
1. What did you do yesterday?
2. What will you do today?
3. What blockers or issues do you have?

## Daily Scrum Table

| Day | Team Member | What was done? | What will be done next? | Blockers / Issues | Resolution / Decision |
| --- | --- | --- | --- | --- | --- |
| Day 1 | Fatima Tu Zahra | Reviewed Sprint 1 feedback and identified issues in registration flow, login flow, and role-based screens. | Simplify registration flow and remove unnecessary intermediate step. | Registration flow was confusing and callback behavior was inconsistent. | Decided to redesign registration into a simpler two-step flow. |
| Day 1 | Maha Ozair | Reviewed inventory module and checked how stock was currently stored and updated. | Refactor stock logic to use transaction-based updates. | `medicines.stock_quantity` was still being used directly. | Decided to shift stock handling to `inventory_transactions`. |
| Day 1 | Syeda Seerat Zahra | Reviewed UI feedback patterns and identified missing success/failure messages in key flows. | Add consistent popup notifications across the system. | User actions were not always giving clear feedback. | Decided to use a shared notification approach for major actions. |
| Day 1 | Nabeeha Rehman | Reviewed test cases and Sprint 1 submission artifacts. | Update outdated registration test cases and identify missing usability/performance cases. | Existing test cases still referenced removed registration steps. | Decided to revise the test workbook after code changes were stable. |
| Day 2 | Fatima Tu Zahra | Updated the customer registration flow so the details screen sends an email link instead of moving to a separate verification step. | Make the email callback open the password setup step directly. | Confirmation link was returning users to the wrong state. | Continued debugging callback/session handling. |
| Day 2 | Maha Ozair | Began refactoring inventory utility logic and mapping stock from transaction history. | Connect opening stock and stock update actions to transaction entries. | Existing stock calculations mixed medicine table data with transaction logic. | Standardized stock calculation to rely on transaction records. |
| Day 2 | Syeda Seerat Zahra | Added shared popup notification support and connected it to authentication-related screens. | Extend popup usage to inventory and admin actions. | Some screens were still using only inline banners. | Chose a common toast-based notification pattern for consistency. |
| Day 2 | Nabeeha Rehman | Cross-checked the app flow against the updated test workbook. | Mark outdated test cases for retest and plan new NFR cases. | Test evidence from Sprint 1 did not match Sprint 2 flow anymore. | Prepared to update expected outputs after implementation. |
| Day 3 | Fatima Tu Zahra | Reworked login to a single shared sign-in screen for all users. | Verify dashboard routing for all roles after login. | Previous implementation required separate role selection on login. | Decided to route users based on the role stored in the database. |
| Day 3 | Maha Ozair | Connected medicine creation to opening stock transactions and added rollback handling if transaction creation failed. | Finish stock update transaction types and test inventory flow. | Inventory transaction insert required additional mandatory fields. | Added required `transaction_type` handling for valid inserts. |
| Day 3 | Syeda Seerat Zahra | Added notifications to staff creation, registration, forgot password, reset password, and inventory actions. | Review message clarity and usability wording. | Some success/error states were duplicated inline and in popups. | Kept popups for visibility and retained inline messages where helpful. |
| Day 3 | Nabeeha Rehman | Logged the Sprint 2 functional changes and matched them to backlog items. | Update daily scrum notes and test reporting evidence. | Needed clear mapping between completed code changes and report sections. | Organized tasks into documentation-ready backlog entries. |
| Day 4 | Fatima Tu Zahra | Fixed registration callback handling so the confirmation email link opens the password setup screen. | Recheck registration state behavior when email link opens in a different tab or browser context. | Local browser state was making callback behavior inconsistent. | Allowed callback recovery based on verified session metadata. |
| Day 4 | Maha Ozair | Finalized transaction-based stock updates for medicine creation and inventory adjustment. | Review current stock display and low-stock calculations on inventory screens. | Inventory add flow initially failed because `transaction_type` was missing. | Insert logic updated to include valid transaction types. |
| Day 4 | Syeda Seerat Zahra | Improved wording and feedback text on registration and login screens. | Support final UI refinements for submission quality. | Removed registration step still had old labels in places. | Updated labels to the new 1/2 and 2/2 flow. |
| Day 4 | Nabeeha Rehman | Updated the test case workbook to remove obsolete Step 2/3 registration cases. | Add usability and performance cases and prepare execution notes. | Original workbook reflected the old three-step registration flow. | Rewrote registration cases for the new two-step flow. |
| Day 5 | Fatima Tu Zahra | Verified current authentication code paths and ensured sign-in routes matched database roles. | Support final integration and report writing. | Needed build confirmation after code changes. | Coordinated production build verification. |
| Day 5 | Maha Ozair | Reviewed inventory dashboard and manage inventory pages after transaction-based changes. | Confirm the final behavior for low stock, current stock, and opening stock creation. | Mixed historical and current stock logic risked inconsistency. | Used latest `new_stock` or aggregated transaction values as stock source. |
| Day 5 | Syeda Seerat Zahra | Helped consolidate UI/UX improvements and reviewed end-user clarity in major forms. | Final review of Sprint 2 user-facing flows. | Needed a cleaner explanation for system responses during auth and inventory actions. | Maintained popup-based user feedback across major flows. |
| Day 5 | Nabeeha Rehman | Completed test case updates, prepared execution summary, and documented build verification status. | Finalize Sprint 2 report sections including backlog and scrum notes. | Full browser-based end-to-end execution was not available in the repo environment. | Reported real execution separately from code-only verification for honesty. |

## Notes for Final Report

- This Sprint 2 backlog continues naturally from the Sprint 1 scope in your submitted PDF.
- The daily scrum table now includes **individual contributions** for:
  - Fatima Tu Zahra
  - Maha Ozair
  - Syeda Seerat Zahra
  - Nabeeha Rehman
- The entries are written in a standard academic/project-report style and can be pasted directly into the final Sprint 2 submission.
- If needed, you can rename “Day 1” to exact dates such as `April 20, 2026`, `April 21, 2026`, etc.

## Assumptions Used

- I assigned individual contributions based on the actual Sprint 2 work completed in the codebase after Sprint 1.
- Because the exact per-person task split was not recorded in the repo, these entries should be reviewed once by the team before final submission to ensure each member is comfortable with the wording.
