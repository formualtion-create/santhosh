"use client";

import { useState } from "react";

// Two-step gate for the irreversible account deletion: an explicit acknowledgement
// checkbox arms the button, and a final native confirm() catches accidental submits.
export default function DeleteAccount() {
  const [armed, setArmed] = useState(false);

  return (
    <form
      action="/api/account/delete"
      method="post"
      onSubmit={(e) => {
        if (!confirm("This permanently erases your account, pet profile, matches and messages. This cannot be undone.\n\nAre you absolutely sure?")) {
          e.preventDefault();
        }
      }}
    >
      <label className="danger-gate">
        <input type="checkbox" checked={armed} onChange={(e) => setArmed(e.target.checked)} />
        <span>I understand this permanently erases my account and all my data, and cannot be undone.</span>
      </label>
      <button className="btn btn-danger btn-sm" type="submit" disabled={!armed}>
        Permanently delete my account
      </button>
    </form>
  );
}
