package com.icake.service;

import com.icake.dto.AddressDTO;
import com.icake.model.Address;
import com.icake.model.ClientAddress;
import com.icake.repository.AddressRepository;
import com.icake.repository.ClientAddressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.icake.repository.ClientRepository;
import com.icake.repository.CityRepository;

import java.util.List;
import java.util.Optional;

@Service
public class AddressService {
    private final AddressRepository addressRepository;
    private final ClientAddressRepository clientAddressRepository;
private final ClientRepository clientRepository;
private final CityRepository cityRepository;

public AddressService(AddressRepository addressRepository, 
                     ClientAddressRepository clientAddressRepository,
                     ClientRepository clientRepository,
                     CityRepository cityRepository) {
    this.addressRepository = addressRepository;
    this.clientAddressRepository = clientAddressRepository;
    this.clientRepository = clientRepository;
    this.cityRepository = cityRepository;
}

    public List<Address> findAll() {
        return addressRepository.findAll();
    }

    public Optional<Address> findById(Long id) {
        return addressRepository.findById(id);
    }

    @Transactional
    public Address save(Address address) {
        return addressRepository.save(address);
    }

    @Transactional
    public void deleteById(Long id) {
        addressRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Address> findByClientId(Long clientId) {
        return clientAddressRepository.findByClientId(clientId);
    }
@Transactional
public AddressDTO createAddressForClient(Long clientId, AddressDTO addressDTO) {
    // Create and save the address
    Address address = new Address();
    address.setZipCode(addressDTO.getZipCode());
    address.setStreet(addressDTO.getStreet());
    address.setNumber(addressDTO.getNumber());
    address.setComplement(addressDTO.getComplement());
    
    // Set the city using the CityDTO
    if (addressDTO.getCity() != null && addressDTO.getCity().getId() != null) {
        address.setCity(cityRepository.getReferenceById(addressDTO.getCity().getId()));
    }
    
    Address savedAddress = addressRepository.save(address);
    
    // Create the client-address relationship
    ClientAddress clientAddress = new ClientAddress();
    clientAddress.setClient(clientRepository.getReferenceById(clientId));
    clientAddress.setAddress(savedAddress);
    clientAddressRepository.save(clientAddress);
    
    return new AddressDTO(savedAddress);
}
}