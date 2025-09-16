package com.icake.service;

import com.icake.model.Address;
import com.icake.repository.AddressRepository;
import com.icake.repository.ClientAddressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AddressService {
    private final AddressRepository addressRepository;
    private final ClientAddressRepository clientAddressRepository;

    public AddressService(AddressRepository addressRepository, ClientAddressRepository clientAddressRepository) {
        this.addressRepository = addressRepository;
        this.clientAddressRepository = clientAddressRepository;
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
}