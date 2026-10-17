const linkClass =
  "underline underline-offset-2 transition-colors hover:text-foreground";

/** Site-wide footer. The OpenStreetMap credit is required by its license. */
export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-6 py-8 text-xs leading-6 text-muted-foreground">
        <p>
          Place data ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            OpenStreetMap contributors
          </a>
          , available under the{" "}
          <a
            href="https://opendatacommons.org/licenses/odbl/"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Open Database License
          </a>
          . Map tiles by{" "}
          <a
            href="https://openfreemap.org"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            OpenFreeMap
          </a>
          .
        </p>

        <p className="mt-1">
          Opening hours, cuisines and features are volunteered and may be
          incomplete or out of date.
        </p>
      </div>
    </footer>
  );
}
