
import pandas as pd

nodes = pd.read_csv("outputs/nodes_port.csv")

final_ports = nodes[
    ["id", "name", "unlocode", "country",
     "country_iso3", "lat", "lon"]
].copy()

final_ports.to_csv(
    "outputs/final_13_ports.csv",
    index=False
)

print("Final port list created successfully!")
print("Total ports:", len(final_ports))
print(final_ports[["id", "name", "country"]])
