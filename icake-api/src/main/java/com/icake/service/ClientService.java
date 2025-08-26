package com.icake.service;

import com.icake.model.Client;
import com.icake.repository.ClientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ClientService {
    private final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public List<Client> findAll() {
        return clientRepository.findAll();
    }

    public Optional<Client> findById(Long id) {
        return clientRepository.findById(id);
    }

    @Transactional
    public Client save(Client client) {
        return clientRepository.save(client);
    }

    @Transactional
    public void deleteById(Long id) {
        clientRepository.deleteById(id);
    }
}