

\# AtmoGraph - GNN Feature Preprocessing Summary



\## 1. Overview



This document summarizes the feature preprocessing work completed for the AtmoGraph Supply Chain Ripple Effect Predictor project as part of Week 2.



The preprocessing pipeline prepares node and relationship attributes for future Graph Neural Network (GNN) development.



\## 2. Graph Dataset Overview



The graph dataset contains:



\- Total Nodes: 45

\- Total Relationships: 108



\### Node Types



| Node Type | Count |

|---|---:|

| Suppliers | 5 |

| Manufacturers | 5 |

| Ports | 13 |

| Distributors | 10 |

| Disruption Events | 12 |

| \*\*Total\*\* | \*\*45\*\* |



\### Relationship Types



| Relationship Type | Count |

|---|---:|

| SUPPLIES\_TO | 25 |

| SHIPS\_VIA | 9 |

| ROUTE\_TO | 50 |

| DELIVERS\_TO | 12 |

| HAD\_DISRUPTION | 12 |

| \*\*Total\*\* | \*\*108\*\* |



\## 3. Node Feature Preprocessing



The node attributes were selected according to their relevance to supply chain entities.



The preprocessing steps included:



\- Selecting relevant numerical and categorical attributes.

\- Identifying missing values.

\- Creating missing-value indicators where required.

\- Applying median imputation to missing numerical values.

\- Applying One-Hot Encoding to categorical attributes.

\- Applying StandardScaler to numerical features.

\- Converting processed features into float32 format.



\### Node Feature Matrix Dimensions



| Node Type | Matrix Shape |

|---|---|

| Suppliers | (5, 9) |

| Manufacturers | (5, 12) |

| Ports | (13, 17) |

| Distributors | (10, 12) |

| Disruption Events | (12, 1) |



\## 4. Relationship Feature Preprocessing



Relationship attributes were selected based on their relevance to supply chain connectivity and transportation characteristics.



The preprocessing steps included:



\- Selecting relevant numerical and categorical attributes.

\- Applying One-Hot Encoding where applicable.

\- Scaling numerical features.

\- Converting processed features into float32 format.

\- Preserving source and destination connectivity.



Certain attributes were excluded to avoid constant-value features or potential target leakage.



\### Relationship Feature Matrix Dimensions



| Relationship Type | Matrix Shape |

|---|---|

| SUPPLIES\_TO | (25, 8) |

| SHIPS\_VIA | (9, 4) |

| ROUTE\_TO | (50, 15) |

| DELIVERS\_TO | (12, 3) |

| HAD\_DISRUPTION | (12, 0) |



The HAD\_DISRUPTION relationship contains connectivity information but no additional numerical or categorical features.



\## 5. Graph Connectivity Preparation



Source and destination entity IDs were mapped to numerical indices.



Edge index matrices were generated for all five relationship types using the source and destination node mappings.



All 108 relationships passed endpoint validation, confirming that their referenced nodes were available in the graph mappings.



\## 6. Validation Results



The following checks were completed:



\- All five node feature matrices were generated successfully.

\- All five relationship feature matrices were generated successfully.

\- No missing values remained in the processed matrices.

\- All processed feature values were numeric.

\- No infinite values were detected.

\- All matrices were converted to float32.

\- All relationship endpoints passed validation.



\## 7. Important Feature Selection Decisions



\- The SHIPS\_VIA transport\_mode attribute was excluded because it contained only one constant value.

\- The DELIVERS\_TO transport\_mode attribute was excluded for the same reason.

\- ROUTE\_TO outcome-related attributes such as avg\_delay\_days, disruption\_rate and delayed\_rate were excluded to avoid potential target leakage.

\- Missing historical port information was preserved through missing-value indicators before median imputation.



\## 8. Current Status and Next Steps



The feature preprocessing pipeline has been implemented and validated in the Jupyter Notebook:



`notebooks/03\_gnn\_feature\_preprocessing.ipynb`



The feature matrices have been generated in memory and validated. Exporting the matrices and metadata to persistent files remains a separate pending task.



The next steps include:



1\. Exporting processed node and relationship features.

2\. Finalizing the GNN prediction target and label-generation strategy.

3\. Preparing graph tensors for model development.

4\. Developing and evaluating the GNN prototype.



\*\*Note:\*\* The current graph is a small prototype dataset. Any simulated or derived values must be clearly distinguished from actual historical observations.



