

## Fix: Delete Orphaned Auth User for optimum@optimum.com

The auth user `a30603a3-df97-402d-9778-246d7c8931e2` (optimum@optimum.com) still exists in the authentication system even though all their data was deleted. This blocks re-registration.

### Plan

1. **Invoke the `admin-get-signups` edge function** with `action: "permanent_delete"` and `userId: "a30603a3-df97-402d-9778-246d7c8931e2"` to remove the orphaned auth user.

That's it — one API call to clear the orphaned record so the email can be used again.

