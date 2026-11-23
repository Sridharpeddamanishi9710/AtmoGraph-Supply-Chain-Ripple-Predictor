
import pandas as pd

file_path = "outputs/port_disruption_records.json"

df = pd.read_json(file_path)

print("----- DATA QUALITY REPORT -----")

# Check duplicate records
print("\nDuplicate records:", df.duplicated().sum())

# Check missing values
print("\nMissing values:")
print(df.isnull().sum())

# Check date and year mismatches
df["Date"] = pd.to_datetime(df["Date"], errors="coerce")

mismatch = df[
    df["Date"].notna() &
    (df["Date"].dt.year != df["Year"])
]

print("\nDate and Year mismatches:", len(mismatch))
print(mismatch[["Event", "port_name", "Year", "Date"]].head())

# Check severity values
print("\nSeverity distribution:")
print(df["severity"].value_counts().sort_index())

print("\nData quality analysis completed!")
