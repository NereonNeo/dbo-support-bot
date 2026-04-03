const padNumber = (value: number, length: number) => String(value).padStart(length, "0");

export const formatRequestNumber = (id: number, createdAt: Date): string => {
  const year = createdAt.getFullYear();
  const month = padNumber(createdAt.getMonth() + 1, 2);
  const day = padNumber(createdAt.getDate(), 2);
  const sequence = padNumber(id, 6);
  return `REQ-${year}${month}${day}-${sequence}`;
};
