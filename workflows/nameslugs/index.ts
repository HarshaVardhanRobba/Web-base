import {adjectives, uniqueNamesGenerator} from "unique-names-generator";

import {computerScience} from "./dictionaries";

export function generateSlug() {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, computerScience],
    separator: "-",
    length: 2,
  });
}
