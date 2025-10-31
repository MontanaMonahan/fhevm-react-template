// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateFoodTraceability is SepoliaConfig {

    address public owner;
    uint32 public nextProductId;
    uint32 public nextBatchId;

    struct FoodSource {
        euint32 farmId;           // Encrypted farm identifier
        euint32 coordinates;      // Encrypted coordinates
        euint64 harvestDate;      // Encrypted harvest date
        euint32 quality;          // Encrypted quality score (0-100)
        bool verified;            // Public verification status
        uint256 timestamp;        // Public registration timestamp
    }

    struct ProductBatch {
        euint32 sourceId;         // Encrypted source reference
        euint32 processingId;     // Encrypted processing facility ID
        euint64 processDate;      // Encrypted processing date
        euint32 temperature;      // Encrypted storage temperature
        euint32 humidity;         // Encrypted storage humidity
        bool authenticated;       // Public authentication status
        address producer;         // Public producer address
        uint256 created;          // Public creation timestamp
    }

    struct VerificationRecord {
        euint32 batchId;          // Encrypted batch reference
        euint32 inspectorId;      // Encrypted inspector ID
        euint64 inspectionDate;   // Encrypted inspection date
        euint32 safetyScore;      // Encrypted safety score (0-100)
        ebool passedInspection;   // Encrypted pass/fail status
        bool publiclyVerified;    // Public verification flag
        uint256 recordTime;       // Public record timestamp
    }

    mapping(uint32 => FoodSource) public foodSources;
    mapping(uint32 => ProductBatch) public productBatches;
    mapping(uint32 => VerificationRecord) public verificationRecords;
    mapping(address => bool) public authorizedProducers;
    mapping(address => bool) public certifiedInspectors;
    mapping(uint32 => address[]) public batchVerifiers;

    uint32 public totalSources;
    uint32 public totalBatches;
    uint32 public totalVerifications;

    event SourceRegistered(uint32 indexed sourceId, address indexed producer, uint256 timestamp);
    event BatchCreated(uint32 indexed batchId, uint32 indexed sourceId, address indexed producer);
    event VerificationCompleted(uint32 indexed verificationId, uint32 indexed batchId, address inspector);
    event ProducerAuthorized(address indexed producer, address authorizer);
    event InspectorCertified(address indexed inspector, address certifier);
    event QualityAlert(uint32 indexed batchId, string alertType);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyAuthorizedProducer() {
        require(authorizedProducers[msg.sender], "Not authorized producer");
        _;
    }

    modifier onlyCertifiedInspector() {
        require(certifiedInspectors[msg.sender], "Not certified inspector");
        _;
    }

    constructor() {
        owner = msg.sender;
        nextProductId = 1;
        nextBatchId = 1;
        authorizedProducers[msg.sender] = true;
        certifiedInspectors[msg.sender] = true;
    }

    // Register food source with encrypted details
    function registerFoodSource(
        uint32 _farmId,
        uint32 _coordinates,
        uint64 _harvestDate,
        uint32 _quality
    ) external onlyAuthorizedProducer {
        require(_quality <= 100, "Quality score must be 0-100");

        // Encrypt sensitive data
        euint32 encryptedFarmId = FHE.asEuint32(_farmId);
        euint32 encryptedCoordinates = FHE.asEuint32(_coordinates);
        euint64 encryptedHarvestDate = FHE.asEuint64(_harvestDate);
        euint32 encryptedQuality = FHE.asEuint32(_quality);

        uint32 sourceId = totalSources + 1;

        foodSources[sourceId] = FoodSource({
            farmId: encryptedFarmId,
            coordinates: encryptedCoordinates,
            harvestDate: encryptedHarvestDate,
            quality: encryptedQuality,
            verified: false,
            timestamp: block.timestamp
        });

        // Grant ACL permissions
        FHE.allowThis(encryptedFarmId);
        FHE.allowThis(encryptedCoordinates);
        FHE.allowThis(encryptedHarvestDate);
        FHE.allowThis(encryptedQuality);

        FHE.allow(encryptedFarmId, msg.sender);
        FHE.allow(encryptedCoordinates, msg.sender);
        FHE.allow(encryptedHarvestDate, msg.sender);
        FHE.allow(encryptedQuality, msg.sender);

        totalSources++;

        emit SourceRegistered(sourceId, msg.sender, block.timestamp);
    }

    // Create product batch with encrypted processing details
    function createProductBatch(
        uint32 _sourceId,
        uint32 _processingId,
        uint64 _processDate,
        uint32 _temperature,
        uint32 _humidity
    ) external onlyAuthorizedProducer {
        require(_sourceId <= totalSources && _sourceId > 0, "Invalid source ID");
        require(_temperature <= 1000, "Invalid temperature");
        require(_humidity <= 100, "Invalid humidity");

        // Encrypt processing data
        euint32 encryptedSourceId = FHE.asEuint32(_sourceId);
        euint32 encryptedProcessingId = FHE.asEuint32(_processingId);
        euint64 encryptedProcessDate = FHE.asEuint64(_processDate);
        euint32 encryptedTemperature = FHE.asEuint32(_temperature);
        euint32 encryptedHumidity = FHE.asEuint32(_humidity);

        uint32 batchId = totalBatches + 1;

        productBatches[batchId] = ProductBatch({
            sourceId: encryptedSourceId,
            processingId: encryptedProcessingId,
            processDate: encryptedProcessDate,
            temperature: encryptedTemperature,
            humidity: encryptedHumidity,
            authenticated: false,
            producer: msg.sender,
            created: block.timestamp
        });

        // Grant ACL permissions
        FHE.allowThis(encryptedSourceId);
        FHE.allowThis(encryptedProcessingId);
        FHE.allowThis(encryptedProcessDate);
        FHE.allowThis(encryptedTemperature);
        FHE.allowThis(encryptedHumidity);

        FHE.allow(encryptedSourceId, msg.sender);
        FHE.allow(encryptedProcessingId, msg.sender);
        FHE.allow(encryptedProcessDate, msg.sender);
        FHE.allow(encryptedTemperature, msg.sender);
        FHE.allow(encryptedHumidity, msg.sender);

        totalBatches++;

        emit BatchCreated(batchId, _sourceId, msg.sender);
    }

    // Verify batch with encrypted inspection data
    function verifyBatch(
        uint32 _batchId,
        uint32 _inspectorId,
        uint64 _inspectionDate,
        uint32 _safetyScore,
        bool _passed
    ) external onlyCertifiedInspector {
        require(_batchId <= totalBatches && _batchId > 0, "Invalid batch ID");
        require(_safetyScore <= 100, "Safety score must be 0-100");

        // Encrypt verification data
        euint32 encryptedBatchId = FHE.asEuint32(_batchId);
        euint32 encryptedInspectorId = FHE.asEuint32(_inspectorId);
        euint64 encryptedInspectionDate = FHE.asEuint64(_inspectionDate);
        euint32 encryptedSafetyScore = FHE.asEuint32(_safetyScore);
        ebool encryptedPassed = FHE.asEbool(_passed);

        uint32 verificationId = totalVerifications + 1;

        verificationRecords[verificationId] = VerificationRecord({
            batchId: encryptedBatchId,
            inspectorId: encryptedInspectorId,
            inspectionDate: encryptedInspectionDate,
            safetyScore: encryptedSafetyScore,
            passedInspection: encryptedPassed,
            publiclyVerified: _passed,
            recordTime: block.timestamp
        });

        // Grant ACL permissions
        FHE.allowThis(encryptedBatchId);
        FHE.allowThis(encryptedInspectorId);
        FHE.allowThis(encryptedInspectionDate);
        FHE.allowThis(encryptedSafetyScore);
        FHE.allowThis(encryptedPassed);

        FHE.allow(encryptedBatchId, msg.sender);
        FHE.allow(encryptedInspectorId, msg.sender);
        FHE.allow(encryptedInspectionDate, msg.sender);
        FHE.allow(encryptedSafetyScore, msg.sender);
        FHE.allow(encryptedPassed, msg.sender);

        // Update batch verification status
        if (_passed) {
            productBatches[_batchId].authenticated = true;
        }

        batchVerifiers[_batchId].push(msg.sender);
        totalVerifications++;

        // Emit quality alert if safety score is low
        if (_safetyScore < 50) {
            emit QualityAlert(_batchId, "Low Safety Score");
        }

        emit VerificationCompleted(verificationId, _batchId, msg.sender);
    }

    // Authorize food producer
    function authorizeProducer(address producer) external onlyOwner {
        authorizedProducers[producer] = true;
        emit ProducerAuthorized(producer, msg.sender);
    }

    // Certify inspector
    function certifyInspector(address inspector) external onlyOwner {
        certifiedInspectors[inspector] = true;
        emit InspectorCertified(inspector, msg.sender);
    }

    // Get public batch information
    function getBatchInfo(uint32 batchId) external view returns (
        address producer,
        bool authenticated,
        uint256 created,
        uint256 verifierCount
    ) {
        require(batchId <= totalBatches && batchId > 0, "Invalid batch ID");

        ProductBatch storage batch = productBatches[batchId];
        return (
            batch.producer,
            batch.authenticated,
            batch.created,
            batchVerifiers[batchId].length
        );
    }

    // Get source verification status
    function getSourceStatus(uint32 sourceId) external view returns (
        bool verified,
        uint256 timestamp
    ) {
        require(sourceId <= totalSources && sourceId > 0, "Invalid source ID");

        FoodSource storage source = foodSources[sourceId];
        return (source.verified, source.timestamp);
    }

    // Get verification record public data
    function getVerificationInfo(uint32 verificationId) external view returns (
        bool publiclyVerified,
        uint256 recordTime
    ) {
        require(verificationId <= totalVerifications && verificationId > 0, "Invalid verification ID");

        VerificationRecord storage record = verificationRecords[verificationId];
        return (record.publiclyVerified, record.recordTime);
    }

    // Get contract statistics
    function getContractStats() external view returns (
        uint32 sourcesCount,
        uint32 batchesCount,
        uint32 verificationsCount,
        uint256 contractDeployed
    ) {
        return (totalSources, totalBatches, totalVerifications, block.timestamp);
    }

    // Check if address is authorized producer
    function isAuthorizedProducer(address producer) external view returns (bool) {
        return authorizedProducers[producer];
    }

    // Check if address is certified inspector
    function isCertifiedInspector(address inspector) external view returns (bool) {
        return certifiedInspectors[inspector];
    }

    // Get batch verifiers list
    function getBatchVerifiers(uint32 batchId) external view returns (address[] memory) {
        require(batchId <= totalBatches && batchId > 0, "Invalid batch ID");
        return batchVerifiers[batchId];
    }
}