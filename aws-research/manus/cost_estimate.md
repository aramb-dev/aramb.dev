# AWS EC2 Self-Hosted AI Agent - Cost Estimate

This document provides an estimated monthly cost for running a self-hosted AI agent on AWS EC2, based on the requirements discussed and researched instance types suitable for the specified AI models.

## Assumptions

*   **Region:** US East (N. Virginia) - `us-east-1`
*   **Pricing Model:** On-Demand (Linux)
*   **Usage Pattern:** Assumed usage of approximately 10 hours per weekday and 4 hours per weekend day, totaling roughly **251 hours per month**. The auto-shutdown mechanism (AWS Lambda + CloudWatch Events) is assumed to be effective in stopping the instance during non-usage hours.
*   **EC2 Instance Storage:** 200 GB gp3 EBS volume assumed for the operating system, AI models, code-server, and other necessary software. Pricing is approximately $0.08/GB-month.
*   **Data Transfer:** The first 100 GB/month of data transfer OUT to the internet is free. Costs beyond this are ~$0.09/GB. Data transfer IN is free. Estimates below assume data transfer costs are minimal, but actual costs may vary based on usage.
*   **Elastic IP Address:** Assumed to be associated with a running instance, making it free. If the instance is stopped but the EIP remains allocated, a small hourly charge applies (~$0.005/hour).
*   **Lambda & CloudWatch:** Costs for the auto-start/stop Lambda function and CloudWatch Events schedule are expected to be negligible due to AWS Free Tier allowances.

## Estimated Monthly Costs (On-Demand)

The following estimates compare different GPU instance types based on their suitability for the range of AI models mentioned (from smaller coder models up to Mixtral 8x7B and potentially quantized Llama 3 70B):

1.  **g4dn.xlarge**
    *   Specs: 1x NVIDIA T4 GPU (16 GB VRAM), 4 vCPU, 16 GiB RAM
    *   Suitability: Good for smaller models (up to ~13B parameters, potentially quantized 30B), basic ML inference, remote workstation.
    *   Compute Cost: ~251 hours * $0.526/hour ≈ $132.03
    *   Storage Cost (200 GB gp3): ≈ $16.00
    *   **Estimated Total: ~$148.03 / month**

2.  **g5.xlarge**
    *   Specs: 1x NVIDIA A10G GPU (24 GB VRAM), 4 vCPU, 16 GiB RAM
    *   Suitability: Better performance than G4dn, more VRAM handles larger models (up to ~20B, potentially quantized 40B).
    *   Compute Cost: ~251 hours * $1.006/hour ≈ $252.51
    *   Storage Cost (200 GB gp3): ≈ $16.00
    *   **Estimated Total: ~$268.51 / month**

3.  **g5.2xlarge**
    *   Specs: 1x NVIDIA A10G GPU (24 GB VRAM), 8 vCPU, 32 GiB RAM
    *   Suitability: Same GPU as g5.xlarge but more CPU/RAM, potentially useful if CPU becomes a bottleneck during inference or other tasks.
    *   Compute Cost: ~251 hours * $1.212/hour ≈ $304.21
    *   Storage Cost (200 GB gp3): ≈ $16.00
    *   **Estimated Total: ~$320.21 / month**

4.  **g5.4xlarge**
    *   Specs: 1x NVIDIA A10G GPU (24 GB VRAM), 16 vCPU, 64 GiB RAM
    *   Suitability: Even more CPU/RAM than g5.2xlarge for demanding workloads alongside the GPU.
    *   Compute Cost: ~251 hours * $1.624/hour ≈ $407.62
    *   Storage Cost (200 GB gp3): ≈ $16.00
    *   **Estimated Total: ~$423.62 / month**

5.  **g5.12xlarge**
    *   Specs: 4x NVIDIA A10G GPUs (96 GB total VRAM), 48 vCPU, 192 GiB RAM
    *   Suitability: Required for running larger models like Mixtral 8x7B (~48GB VRAM needed) and potentially heavily quantized versions of Llama 3 70B.
    *   Compute Cost: ~251 hours * $5.672/hour ≈ $1423.67
    *   Storage Cost (200 GB gp3): ≈ $16.00
    *   **Estimated Total: ~$1439.67 / month**

## Notes on Cost Optimization

*   **Auto-Shutdown:** The assumed usage pattern relies heavily on the auto-shutdown script working correctly. Ensure the schedule accurately reflects non-usage hours.
*   **Instance Selection:** Choose the smallest instance type that meets your VRAM and performance needs for the models you run most often. Running larger models like Llama 3 70B significantly increases costs.
*   **Reserved Instances (RIs) / Savings Plans (SPs):** If your usage becomes consistent, committing to a 1-year or 3-year RI or SP can provide substantial discounts (30-60% or more) compared to On-Demand pricing. This requires a longer-term commitment.
*   **Spot Instances:** For non-critical or interruptible workloads, Spot Instances can offer up to 90% savings over On-Demand prices, but they can be terminated by AWS with little notice. This is generally not suitable for an interactive agent setup but could be considered for batch processing tasks.

This estimate provides a baseline. Actual costs will depend on the specific instance chosen, actual usage hours, data transfer patterns, and storage requirements.
