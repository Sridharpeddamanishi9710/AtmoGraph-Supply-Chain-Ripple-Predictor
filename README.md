\# AtmoGraph: Supply Chain Ripple Effect Predictor



\## Project Overview



AtmoGraph is an AI-based supply-chain disruption prediction project designed to analyze how disruptions in one part of a supply-chain network can affect other connected entities.



The project combines Graph Neural Networks (GNN), Natural Language Processing (NLP), Neo4j, and interactive network visualization to identify potential risks and estimate downstream disruption impacts.



\## My Role: Data Scientist \& GNN Developer



\*\*Team Member:\*\* Sridhar Pedhamanishi  

\*\*Branch:\*\* `sridhar`



My primary responsibility is to develop the data science and Graph Neural Network components of AtmoGraph.



\### Key Responsibilities



\- Analyze and understand supply-chain datasets.

\- Prepare and clean graph-related data.

\- Identify and engineer node and edge features.

\- Integrate disruption event information extracted by the NLP module.

\- Prepare graph inputs using PyTorch Geometric.

\- Develop a GNN-based disruption risk prediction prototype.

\- Evaluate model performance using appropriate evaluation metrics.

\- Integrate prediction functionality with the FastAPI backend.



\## Project Technologies



| Technology | Purpose |

|---|---|

| Python | Core development and data processing |

| Pandas | Dataset analysis and preprocessing |

| NumPy | Numerical operations |

| PyTorch | Deep learning model development |

| PyTorch Geometric | Graph Neural Network implementation |

| Neo4j | Supply-chain graph database |

| FastAPI | Backend API integration |

| React | Frontend dashboard |

| D3.js / React Flow | Supply-chain network visualization |



\## My Branch Structure



```text

AtmoGraph-Supply-Chain-Ripple-Predictor/

│

├── data/

│   ├── raw/

│   └── processed/

│

├── notebooks/

│

├── src/

│

├── models/

│

├── dashboard/

│

├── reports/

│   ├── gnn\_development\_plan.md

│   ├── gnn\_input\_requirements.md

│   └── gnn\_feature\_engineering\_plan.md

│

├── tests/

│

├── README.md

├── requirements.txt

└── .gitignore

```



\## GNN Development Workflow



1\. \*\*Dataset Inspection:\*\* Understand the available supply-chain entities, relationships, and historical information.

2\. \*\*Data Preprocessing:\*\* Clean and prepare the available data.

3\. \*\*Feature Engineering:\*\* Identify node, edge, and disruption event features.

4\. \*\*Graph Preparation:\*\* Convert the graph into PyTorch Geometric input structures.

5\. \*\*Model Development:\*\* Develop a GNN model for downstream disruption risk prediction.

6\. \*\*Model Evaluation:\*\* Evaluate the model using suitable metrics and available labels.

7\. \*\*API Integration:\*\* Connect the prediction module with the FastAPI backend.



\## Current Documentation



The following documents describe my planned GNN development work:



\- `reports/gnn\_development\_plan.md` - Overall GNN development approach.

\- `reports/gnn\_input\_requirements.md` - Required graph inputs and feature information.

\- `reports/gnn\_feature\_engineering\_plan.md` - Planned node, edge, and disruption feature preparation.



\## Current Progress



\- \[x] Initial project repository setup.

\- \[x] Project overview and workflow documentation.

\- \[x] Supply-chain data preparation plan.

\- \[x] GNN development plan.

\- \[x] GNN input requirements documentation.

\- \[x] GNN feature engineering plan.

\- \[ ] Final dataset inspection.

\- \[ ] Graph feature preparation implementation.

\- \[ ] PyTorch Geometric graph construction.

\- \[ ] GNN model development and evaluation.

\- \[ ] FastAPI integration.



\*Note: Completed items above refer to documentation and planning activities. Model implementation and evaluation are still pending.\*



\## Team Collaboration



This project is developed collaboratively by four team members:



\- \*\*Sridhar Pedhamanishi:\*\* Data Science and GNN Development.

\- \*\*Krish Mangal:\*\* Graph Database Development.

\- \*\*Sneha:\*\* NLP and Disruption Event Extraction.

\- \*\*Vedant:\*\* Frontend and Network Visualization.



The modules will be integrated to create an end-to-end supply-chain disruption analysis and prediction system.



\## Project Goal



To build an interactive AI-powered system that analyzes supply-chain networks, identifies disruptions, and estimates their potential ripple effects across connected entities.

