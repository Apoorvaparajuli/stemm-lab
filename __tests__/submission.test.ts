const buildSubmission = (data: any) => ({
  challengeId: data.challengeId ?? "",
  teamName: data.teamName?.trim() ?? "",
  resultSummary: data.resultSummary?.trim() ?? "",
  observations: data.observations?.trim() ?? "",
  evidenceUrl: data.evidenceUrl ?? null,
  evidenceType: data.evidenceType ?? null,
  gpsLocation: data.gpsLocation ?? null,
});

const isValidSubmission = (data: any) => {
  return (
    !!data.challengeId &&
    !!data.teamName &&
    !!data.resultSummary &&
    !!data.observations
  );
};

test("builds submission with trimmed team name", () => {
  const result = buildSubmission({
    challengeId: "1",
    teamName: "  Team Newton  ",
    resultSummary: "Good result",
    observations: "Some notes",
  });
  expect(result.teamName).toBe("Team Newton");
});

test("sets null for missing evidence", () => {
  const result = buildSubmission({ challengeId: "1" });
  expect(result.evidenceUrl).toBeNull();
  expect(result.evidenceType).toBeNull();
});

test("sets null for missing GPS", () => {
  const result = buildSubmission({ challengeId: "1" });
  expect(result.gpsLocation).toBeNull();
});

test("validates complete submission", () => {
  expect(
    isValidSubmission({
      challengeId: "1",
      teamName: "Team Newton",
      resultSummary: "Result",
      observations: "Notes",
    }),
  ).toBe(true);
});

test("rejects incomplete submission", () => {
  expect(
    isValidSubmission({
      challengeId: "1",
      teamName: "",
    }),
  ).toBe(false);
});
