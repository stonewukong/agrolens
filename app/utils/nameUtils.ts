export function getDisplayInitial(fullName: string | null | undefined): string {
  if (!fullName) return 'F';

  // Split the name into parts
  const nameParts = fullName.trim().split(' ');

  // If it's just an initial or single character, return first word capitalized
  if (nameParts[0].length <= 1) {
    return 'Farmer';
  }

  // Otherwise return first letter of first name
  return nameParts[0][0].toUpperCase();
}

export function getDisplayName(fullName: string | null | undefined): string {
  if (!fullName) return 'Farmer';

  // Split the name into parts
  const nameParts = fullName.trim().split(' ');

  // If it's just an initial or single character, return 'Farmer'
  if (nameParts[0].length <= 1) {
    return 'Farmer';
  }

  // Otherwise return the full name
  return fullName;
}
