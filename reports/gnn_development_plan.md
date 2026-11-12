\# GNN Development Plan



\## 1. Objective

Develop a Graph Neural Network (GNN) prototype to estimate how supply chain disruptions can affect connected entities.



\## 2. Input Data

\- Supply chain nodes such as suppliers, manufacturers and ports.

\- Relationships between connected entities.

\- Disruption events extracted from news articles.

\- Node and edge features required for model training.



\## 3. Data Preparation

\- Validate graph nodes and relationships.

\- Maintain consistent node IDs.

\- Convert graph information into numerical features.

\- Prepare disruption features for model input.

\- Define suitable prediction targets.



\## 4. Model Development

Use PyTorch Geometric to build a GNN prototype that analyzes relationships between supply chain entities and estimates downstream risk.



\## 5. Model Evaluation

Evaluate the model using appropriate metrics and compare its performance with a simple baseline.



\## 6. Expected Output

\- Risk score or risk classification.

\- Affected downstream entities.

\- Estimated delay, if supported by the available data.

\- Prediction horizon and model version.



\## 7. Current Status

This document describes the planned development approach. Actual implementation and evaluation results will be added as development progresses.

