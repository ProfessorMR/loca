import { LogoMark } from "@/components/shared/logo";

const linkClass =
  "underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground";

/** Site-wide footer. The OpenStreetMap credit is required by its license. */
export function Footer() {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm leading-6 text-muted-foreground sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-2.5 text-foreground">
          <LogoMark className="size-7" />
          <span className="display text-base">LOCA</span>
        </div>

        <div className="max-w-xl space-y-2 md:text-right">
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

          <p>
            Opening hours, cuisines and features are volunteered and may be
            incomplete or out of date.
          </p>
        </div>
      </div>
    </footer>
  );
}
