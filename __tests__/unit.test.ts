const formatTime = (value: number) => {
  const mins = Math.floor(value / 60);
  const secs = value % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

test("formats 90 seconds as 01:30", () => {
  expect(formatTime(90)).toBe("01:30");
});

test("formats 0 seconds as 00:00", () => {
  expect(formatTime(0)).toBe("00:00");
});

test("formats 3661 seconds correctly", () => {
  expect(formatTime(3661)).toBe("61:01");
});
