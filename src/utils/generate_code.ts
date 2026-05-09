export const generateCode = (digits: number = 6) => {
  return Math.floor(Math.random() * Math.pow(10, digits)).toString().padStart(digits, "0");
}