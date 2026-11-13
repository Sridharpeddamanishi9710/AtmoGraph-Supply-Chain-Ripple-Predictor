
# GNN Input Data Requirements

## 1. Overview

This document defines the input data required to develop the Graph Neural Network (GNN) module for AtmoGraph.

The model will analyze supply-chain relationships and estimate how disruptions may affect connected entities.

## 2. Graph Node Features

Each node represents a supply-chain entity, such as a supplier, manufacturer, port or distribution center.

Expected node features:

- Node ID
- Node type
- Location
- Risk level
- Disruption status
- Historical delay information (if available)

## 3. Graph Edge Features

Each edge represents a relationship between two supply-chain entities.

Expected edge features:

- Source node ID
- Target node ID
- Relationship type
- Route distance (if available)
- Transportation mode (if available)
- Historical delay information (if available)

## 4. Disruption Event Features

Disruption events will be received from the NLP module.

Expected features:

- Event ID
- Matched node ID
- Event type
- Location
- Severity
- Event date
- Confidence score

These events will help identify affected nodes in the supply-chain graph.

## 5. Prediction Target

The GNN model will aim to predict downstream supply-chain disruption risk.

Potential prediction targets:

- Risk classification (Low, Medium, High)
- Delay risk
- Estimated delay duration, if suitable training labels are available

The final prediction target will depend on the availability and quality of the selected dataset labels.

## 6. GNN Input Preparation

The following steps are planned:

1. Load graph nodes and relationships.
2. Convert node and edge information into numerical features.
3. Encode categorical features.
4. Map disruption events to graph node IDs.
5. Prepare graph structure and feature tensors.
6. Split available labeled data into training and testing sets.

## 7. Expected Model Output

The model is expected to generate:

- Affected node ID
- Predicted risk score
- Risk category
- Prediction horizon (30, 60 or 90 days)
- Estimated delay, when supported by the model

## 8. Dependencies

- Python
- PyTorch
- PyTorch Geometric
- Pandas
- NumPy
- Scikit-learn
- Neo4j

## 9. Current Status

This document describes the planned GNN input requirements.

Final feature selection, target labels and preprocessing methods will be confirmed after the team finalizes and validates the datasets.
