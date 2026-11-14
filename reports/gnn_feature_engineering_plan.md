\# GNN Feature Engineering Plan



\## 1. Introduction



Feature engineering is the process of converting raw data into meaningful numerical features that a Graph Neural Network (GNN) can understand.



In AtmoGraph, the supply-chain network consists of entities such as suppliers, manufacturers, ports, warehouses, and shipping routes.



Our objective is to prepare graph features that help the GNN understand the supply-chain structure and estimate how disruptions may affect connected entities.



\*\*Note:\*\* This document describes the planned approach. Final features will be adjusted according to the dataset selected by the team.



\## 2. Node Feature Engineering



Node features represent the properties of individual entities in the supply-chain graph.



Possible node types and features:



| Node type | Potential features |

|---|---|

| Supplier | Supply capacity, reliability, location |

| Manufacturer | Production capacity, inventory level |

| Port | Handling capacity, congestion level, location |

| Warehouse | Storage capacity, inventory level |



Example:



```python

node\_features = {

&#x20;   "capacity": 1000,

&#x20;   "reliability": 0.95,

&#x20;   "risk\_score": 0.20

}

```



These are illustrative values, not actual dataset records.



\## 3. Edge Feature Engineering



Edge features describe the properties of connections between two nodes.



For example, a shipping route connecting two ports may contain:



\- Distance between locations

\- Transportation time

\- Shipping cost

\- Historical delay

\- Route reliability



Example:



```python

edge\_features = {

&#x20;   "distance": 500,

&#x20;   "shipping\_time": 4,

&#x20;   "shipping\_cost": 2000,

&#x20;   "delay\_days": 2

}

```



The actual edge features will depend on the available dataset.



\## 4. Disruption Event Features



Disruption events are important inputs for AtmoGraph because the project aims to understand the impact of supply-chain disruptions.



The NLP module will identify events from news articles, such as:



\- Port strikes

\- Natural disasters

\- Factory shutdowns

\- Transportation disruptions



Potential event features include:



| Feature | Description |

|---|---|

| Event type | Type of disruption |

| Severity | Impact level of the event |

| Confidence | NLP extraction confidence |

| Event date | Date of the disruption |

| Duration | Duration, if available |

| Affected entity | Matched supply-chain node |



Categorical values such as event type and severity will be encoded into numerical representations before model training.



Missing values will be handled carefully rather than automatically treated as zero.



\## 5. Feature Encoding and Normalization



The GNN requires numerical input features.



The planned preprocessing steps are:



1\. Identify numerical and categorical columns.

2\. Encode categorical features.

3\. Handle missing and invalid values.

4\. Normalize numerical features where appropriate.

5\. Check feature ranges and data types.

6\. Ensure consistent feature ordering across training and prediction.



Possible techniques include:



\- One-hot encoding for categorical features.

\- Label or embedding-based encoding where appropriate.

\- Standardization or Min-Max scaling for numerical features.



Preprocessing parameters must be fitted using training data only to avoid data leakage.



\## 6. PyTorch Geometric Input Preparation



We plan to use PyTorch Geometric to represent the supply-chain network.



The main graph inputs are:



| Input | Purpose |

|---|---|

| `x` | Node feature matrix |

| `edge\_index` | Connectivity information between nodes |

| `edge\_attr` | Edge feature matrix, if supported by the selected model |



Illustrative example:



```python

import torch



x = torch.tensor(\[

&#x20;   \[1000, 0.95, 0.20],

&#x20;   \[800, 0.90, 0.35],

&#x20;   \[1200, 0.85, 0.60]

], dtype=torch.float)



edge\_index = torch.tensor(\[

&#x20;   \[0, 1, 1, 2],

&#x20;   \[1, 0, 2, 1]

], dtype=torch.long)



edge\_attr = torch.tensor(\[

&#x20;   \[500, 4],

&#x20;   \[500, 4],

&#x20;   \[300, 2],

&#x20;   \[300, 2]

], dtype=torch.float)

```



This is only a sample graph for understanding the input structure. It does not represent the final project dataset.



The final implementation will use the actual graph data and appropriate PyTorch Geometric data structures.



\## 7. GNN Prediction Target



The proposed objective is to estimate downstream supply-chain disruption risk.



Potential prediction outputs include:



\- Risk score for affected entities.

\- Risk category, such as low, medium, or high.

\- Estimated delay, if suitable historical delay labels are available.

\- Prediction horizon, such as 30, 60, or 90 days.



The final prediction target and model architecture will be selected after examining the available dataset and labels.



Model performance will be evaluated using suitable metrics based on the chosen prediction task.



\## 8. Dataset Dependencies



The final feature engineering implementation depends on the dataset selected by the team.



The following information is required:



\- Node and entity information.

\- Relationships between supply-chain entities.

\- Stable identifiers for matching entities.

\- Historical shipment or delay information, if available.

\- Disruption event information or suitable training labels.



The graph database module will provide structured nodes and relationships. The NLP module will provide extracted disruption events. These outputs will be coordinated before preparing the final GNN inputs.



\## 9. Planned Workflow



1\. Receive and inspect the finalized dataset.

2\. Understand the available entities and relationships.

3\. Identify suitable node and edge features.

4\. Integrate disruption event information.

5\. Clean, encode, and normalize features.

6\. Convert the graph into PyTorch Geometric inputs.

7\. Prepare training and testing data.

8\. Develop and evaluate the GNN model.

9\. Integrate predictions with the FastAPI backend.



\## 10. Current Status



\*\*Status:\*\* Feature engineering planning completed.



\*\*Pending:\*\*

\- Final dataset confirmation.

\- Dataset schema inspection.

\- Selection of actual node and edge features.

\- Prediction target and label validation.

\- Implementation and evaluation of the GNN model.



This plan will be updated based on the actual dataset and integration requirements.

