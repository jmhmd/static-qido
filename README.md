# DICOM web static qido

https://github.com/phiresky/sql.js-httpvfs

https://github.com/chafey/dicomweb-dump

https://github.com/chafey/dicomp10-to-dicomweb-js

Service worker for qido url —> sql transform

Or client script can query directly

Qido service runs either on client or service worker, backed by SQLite static db

https://developers.cloudflare.com/pages/platform/functions

Index: patient and study level

| Attribute Name | Tag |
| --- | --- |
| PatientName | 00100010 |
| PatientID | 00100020 |
| PatientBirthDate | 00100030 |
| AccessionNumber | 00080050 |
| ModalitiesInStudy | 00080061 (if supported on study level) |
| Modality | 00080060 (series level, if ModalitiesInStudy not returned on study level) |
| StudyDate | 00080020 |
| BodyPartExamined | 00180015 (may need to parse DICOM to get this) |
| StudyInstanceUID | 0020000D |


{attributeID} can be one of the following:

{dicomTag}

{dicomKeyword}

{dicomTag}.{attributeID}, where {attributeID} is an element of the sequence specified by {dicomTag}

{dicomKeyword}.{attributeID}, where {attributeID} is an element of the sequence specified by {dicomKeyword}

{dicomTag} is the eight character hexadecimal string corresponding to the Tag of a DICOM Attribute (see 6 in PS3.6 ).

{dicomKeyword} is the Keyword of a DICOM Attribute (see 6 in PS3.6 ).
