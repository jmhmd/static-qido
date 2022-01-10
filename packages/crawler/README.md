# Static QIDO

A *very* rough work in progress to show feasibility of static QIDO-RS using sqlite and [https://github.com/phiresky/sql.js-httpvfs](https://github.com/phiresky/sql.js-httpvfs)

#### Notes

https://proxy.imaging.datacommons.cancer.gov/v1/projects/canceridc-data/locations/us/datasets/idc/dicomStores/v5/dicomWeb/studies?limit=101&offset=0&fuzzymatching=true&includefield=00081030%2C00080060


https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies?offset=0

##### Required study level query keys
StudyDate 00080020

StudyTime 00080030

AccessionNumber 00080050

ModalitiesInStudy 00080061

ReferringPhysicianName 00080090

PatientName 00100010

PatientID 00100020

StudyInstanceUID 0020000D

StudyID 00200010


