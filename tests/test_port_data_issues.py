
import pandas as pd

df = pd.read_json("outputs/port_disruption_records.json")

# Identify date/year mismatches
df["Date"] = pd.to_datetime(df["Date"], errors="coerce")

mismatches = df[
    df["Date"].notna() &
    (df["Date"].dt.year != pd.to_numeric(df["Year"], errors="coerce"))
]

# Identify undocumented severity level
severity_3 = df[df["severity"] == 3]

# Save issue reports
mismatches.to_csv(
    "outputs/date_year_mismatches.csv",
    index=False
)

severity_3.to_csv(
    "outputs/severity_3_records.csv",
    index=False
)

print("Date/year mismatch records:", len(mismatches))
print("Severity 3 records:", len(severity_3))

print("\nSample mismatch records:")
print(mismatches[["Event", "port_name", "Year", "Date"]].head(10))

print("\nSample severity 3 records:")
print(severity_3[["Event", "port_name", "Country", "severity"]].head(10))

print("\nIssue reports generated successfully!")
