---
title: NSA CodebreakerChallenge 2024 Task 1
draft: false
tags:
  - ctf
  - nsa
  - cbc
  - codebreaker
  - forensics
---

# Task 1 - No Token Left Behind - (File Forensics)

> Aaliyah is showing you how Intelligence Analysts work. She pulls up a piece of intelligence she thought was interesting. It shows that APTs are interested in acquiring hardware tokens used for accessing DIB networks. Those are generally controlled items, how could the APT get a hold of one of those? DoD sometimes sends copies of procurement records for controlled items to the NSA for analysis. Aaliyah pulls up the records but realizes it’s in a file format she’s not familiar with. Can you help her look for anything suspicious. If DIB companies are being actively targeted by an adversary the NSA needs to know about it so they can help mitigate the threat. Help Aaliyah determine the outlying activity in the dataset given

We are provided with an "unknown" file called `shipping.db`. Running `file shipping.db` just reveals it to be a ZIP archive, and when `unzip shipping.db`, we see a bunch of XML. This hinted me towards it being some Microsoft Office file format since they're just XML wrapped in zips. To confirm, I used Google's `magika` which is a neural network that is trained on file formats. Using `magika shipping.db` revealed it to be an ODS file. So, I renamed the file to `shipping.ods` and opened it in Excel. 

![[shippingods.png]]

My intuition here was: "What would a malicious user modify in a PO?" and "How would we detect it?". Modifying something like the `email` or `phone` doesn't help an attacker. But a delivery address would-- it would allow them to receive the shipment. How do we detect it? Well, the shipment address would be different than the other entries for the same company. So, I wrote a Python script using `pandas` to automate the search:

```python
import pandas as pd

# Determine filetype is ods based on `magika shipping.db`
# Rename to `ship.ods`
df = pd.read_excel('ship.ods', engine='odf', header=None)

# Get 'Shipping Address' column
shipping = df[1]

# Find only row with single occurrence
# This indicates the shipping address doesn't match the expected for that customer
single_occurrence = shipping[shipping.map(shipping.value_counts()) == 1]

# Get row with that single occurrence
malicious_row = df[df[1] == single_occurrence.values[0]]

# Get order ID
order_id = malicious_row[8]
print(order_id)
```

And we were able to find one entry that had a different shipment address compared to all the others!