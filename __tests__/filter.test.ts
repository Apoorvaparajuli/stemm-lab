const filterChallenges = (challenges: any[], tab: string, search: string) => {
  return challenges.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const isCompleted = c.status === "Completed";
    const matchesTab =
      tab === "All" ||
      (tab === "Completed" && isCompleted) ||
      (tab === "Ongoing" && !isCompleted);
    return matchesSearch && matchesTab;
  });
};

const mock = [
  { id: "1", title: "Parachute Drop", status: "To Do" },
  { id: "2", title: "Sound Hunter", status: "Completed" },
  { id: "3", title: "Reaction Board", status: "Ongoing" },
];

test("returns all challenges for All tab", () => {
  expect(filterChallenges(mock, "All", "").length).toBe(3);
});

test("filters completed challenges only", () => {
  const result = filterChallenges(mock, "Completed", "");
  expect(result.length).toBe(1);
  expect(result[0].title).toBe("Sound Hunter");
});

test("filters ongoing challenges only", () => {
  expect(filterChallenges(mock, "Ongoing", "").length).toBe(2);
});

test("filters by search text", () => {
  const result = filterChallenges(mock, "All", "parachute");
  expect(result.length).toBe(1);
  expect(result[0].id).toBe("1");
});

test("returns empty for no match", () => {
  expect(filterChallenges(mock, "All", "xyz").length).toBe(0);
});
